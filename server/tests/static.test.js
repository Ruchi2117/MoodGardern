import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import request from "supertest";
import { createApp } from "../src/app.js";

let directory, app;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "moodgarden-static-"));
  await mkdir(join(directory, "assets"));
  await writeFile(join(directory, "index.html"), "<!doctype html><html><body>MoodGarden shell</body></html>");
  await writeFile(join(directory, "assets", "index-hash.js"), 'console.log("asset");');
  app = createApp({ serveClient: true, clientDirectory: directory });
});
after(async () => {
  if (!directory) return;
  assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
  assert.ok(basename(directory).startsWith("moodgarden-static-"));
  await rm(directory, { recursive: true, force: true });
});

test("same-origin deployment serves React shell on direct protected route URLs", async () => {
  for (const route of ["/", "/dashboard", "/journal", "/insights", "/login", "/register"]) {
    const response = await request(app).get(route).set("Accept", "text/html").expect(200);
    assert.ok(response.text.includes("MoodGarden shell"));
    assert.equal(response.headers["cache-control"], "no-cache");
  }
});

test("hashed static assets cache independently from private APIs", async () => {
  const asset = await request(app).get("/assets/index-hash.js").expect(200);
  assert.equal(asset.headers["cache-control"], "public, max-age=31536000, immutable");
  const health = await request(app).get("/api/health").expect(200);
  assert.equal(health.headers["cache-control"], "no-store");
});

test("unknown APIs and assets never get an HTML shell masquerading as success", async () => {
  for (const path of ["/api/not-real", "/assets/not-real.js"]) {
    const response = await request(app).get(path).expect(404);
    assert.equal(response.body.error.message, "That resource could not be found.");
  }
  await request(app).get("/api/moods").expect(401);
});
