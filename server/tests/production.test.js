import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { readEnvironment } from "../src/config/environment.js";
import { createApp } from "../src/app.js";
import { authRateLimit } from "../src/middleware/authRateLimit.js";
const env = {
  JWT_SECRET: "test-only-random-secret-at-least-thirty-two",
  MONGODB_URI: "mongodb://127.0.0.1:27017/test",
};
test("development defaults are local; production requires an explicit frontend origin", () => {
  assert.equal(readEnvironment(env).host, "127.0.0.1");
  assert.throws(
    () => readEnvironment({ ...env, NODE_ENV: "production" }),
    /CLIENT_ORIGIN/,
  );
  const value = readEnvironment({
    ...env,
    NODE_ENV: "production",
    CLIENT_ORIGIN: "https://garden.example",
    PORT: "8080",
    TRUST_PROXY: "1",
  });
  assert.equal(value.host, "0.0.0.0");
  assert.equal(value.port, 8080);
  assert.equal(value.trustProxy, 1);
});
test("configuration rejects invalid secrets, ports, origins, and proxy trust", () => {
  for (const patch of [
    { JWT_SECRET: "short" },
    { MONGODB_URI: "" },
    { PORT: "0" },
    { PORT: "70000" },
    { PORT: "3.5" },
    { CLIENT_ORIGIN: "*" },
    { CLIENT_ORIGIN: "https://garden.example/path" },
    { CLIENT_ORIGIN: "https://garden.example/" },
    { TRUST_PROXY: "true" },
    { TRUST_PROXY: "0" },
  ])
    assert.throws(() => readEnvironment({ ...env, ...patch }));
});
test("API responses use privacy/security headers and exact-origin CORS", async () => {
  const app = createApp({ clientOrigin: "https://garden.example" });
  const result = await request(app)
    .get("/api/health")
    .set("Origin", "https://garden.example")
    .expect(200);
  assert.equal(
    result.headers["access-control-allow-origin"],
    "https://garden.example",
  );
  assert.equal(result.headers["cache-control"], "no-store");
  assert.equal(result.headers["x-content-type-options"], "nosniff");
  assert.equal(result.headers["x-frame-options"], "DENY");
  assert.equal(result.headers["x-powered-by"], undefined);
  const other = await request(app)
    .get("/api/health")
    .set("Origin", "https://other.example")
    .expect(200);
  assert.notEqual(
    other.headers["access-control-allow-origin"],
    "https://other.example",
  );
  await request(app)
    .options("/api/auth/login")
    .set("Origin", "https://garden.example")
    .set("Access-Control-Request-Method", "POST")
    .expect(204);
});
test("malformed and oversized bodies have safe errors without stacks", async () => {
  const app = createApp();
  const malformed = await request(app)
    .post("/api/auth/register")
    .set("Content-Type", "application/json")
    .send("{")
    .expect(400);
  assert.deepEqual(malformed.body, {
    error: { message: "Please send valid JSON." },
  });
  const large = await request(app)
    .post("/api/auth/register")
    .send({ note: "x".repeat(33000) })
    .expect(413);
  assert.deepEqual(large.body, {
    error: { message: "The request is too large." },
  });
});
test("authentication limiter blocks repeated attempts with Retry-After then resets", async () => {
  let time = 1000;
  const app = express();
  app.use(authRateLimit({ limit: 2, windowMs: 1000, now: () => time }));
  app.get("/", (_req, res) => res.json({ ok: true }));
  await request(app).get("/").expect(200);
  await request(app).get("/").expect(200);
  const blocked = await request(app).get("/").expect(429);
  assert.equal(blocked.headers["retry-after"], "1");
  assert.ok(!JSON.stringify(blocked.body).includes("stack"));
  time = 2001;
  await request(app).get("/").expect(200);
});
test("untrusted forwarded IP cannot bypass the default authentication limiter", async () => {
  const app = express();
  app.use(authRateLimit({ limit: 1 }));
  app.get("/", (_req, res) => res.send("ok"));
  await request(app).get("/").set("X-Forwarded-For", "1.1.1.1").expect(200);
  await request(app).get("/").set("X-Forwarded-For", "2.2.2.2").expect(429);
});
