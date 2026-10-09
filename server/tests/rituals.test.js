import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";
import User from "../src/models/User.js";
import Ritual from "../src/models/Ritual.js";
import {
  localDay,
  dailyTasks,
  ensureToday,
  ritualGrowth,
} from "../src/services/ritualService.js";
const app = createApp();
let db, a, b, tokenA, tokenB, ritual;
const path = "/api/rituals/today?timeZone=Asia%2FKolkata";
const auth = (token) => ({ Authorization: `Bearer ${token}` });
before(async () => {
  process.env.JWT_SECRET = "ritual-test-secret-at-least-thirty-two-characters";
  db = await MongoMemoryServer.create();
  await connectDatabase(db.getUri("ritual_test"));
  await Ritual.init();
  [a, b] = await User.create([
    { name: "A", email: "a@ritual.test", passwordHash: "test" },
    { name: "B", email: "b@ritual.test", passwordHash: "test" },
  ]);
  const sign = (u) =>
    jwt.sign({}, process.env.JWT_SECRET, {
      subject: u.id,
      issuer: "moodgarden",
      audience: "moodgarden-web",
      expiresIn: "1h",
    });
  tokenA = sign(a);
  tokenB = sign(b);
});
after(async () => {
  await mongoose.disconnect();
  await db?.stop();
});
test("ritual endpoints reject missing and invalid tokens", async () => {
  await request(app).get(path).expect(401);
  await request(app).get(path).set(auth("invalid")).expect(401);
  await request(app)
    .put("/api/rituals/today/tasks/test?timeZone=UTC")
    .send({ completed: true })
    .expect(401);
});
test("local dates respect UTC boundaries, DST, and invalid zones", () => {
  const now = new Date("2026-10-08T00:30:00Z");
  assert.equal(localDay("America/Los_Angeles", now), "2026-10-07");
  assert.equal(localDay("Asia/Kolkata", now), "2026-10-08");
  assert.equal(
    localDay("Pacific/Kiritimati", new Date("2026-10-08T12:30:00Z")),
    "2026-10-09",
  );
  assert.equal(
    localDay("America/New_York", new Date("2026-11-01T06:30:00Z")),
    "2026-11-01",
  );
  assert.throws(() => localDay("invalid"));
  assert.throws(() => localDay(undefined));
});
test("first concurrent reads create exactly one stable three-task set", async () => {
  const results = await Promise.all(
    Array.from({ length: 8 }, () => request(app).get(path).set(auth(tokenA))),
  );
  assert.ok(results.every((r) => r.status === 200));
  assert.equal(new Set(results.map((r) => r.body.data.ritual._id)).size, 1);
  ritual = results[0].body.data.ritual;
  assert.equal(ritual.tasks.length, 3);
  assert.equal(new Set(ritual.tasks.map((t) => t.id)).size, 3);
  assert.equal(ritual.growthAwarded, 0);
  assert.equal(
    await Ritual.countDocuments({ userId: a.id, date: ritual.date }),
    1,
  );
  const repeat = await request(app).get(path).set(auth(tokenA)).expect(200);
  assert.deepEqual(repeat.body.data.ritual.tasks, ritual.tasks);
});
test("generation is deterministic, changes tomorrow, and preserves past growth", async () => {
  const today = dailyTasks(a.id, "2026-10-08");
  assert.deepEqual(today, dailyTasks(a.id, "2026-10-08"));
  assert.notDeepEqual(
    today.map((t) => t.title),
    dailyTasks(a.id, "2026-10-09").map((t) => t.title),
  );
  await ensureToday(a.id, "2000-01-01");
  await Ritual.updateOne(
    { userId: a.id, date: "2000-01-01" },
    { $set: { growthAwarded: 3 } },
  );
  await ensureToday(a.id, "2000-01-07");
  assert.equal(await ritualGrowth(a.id), 3);
});
test("completion persists timestamp and concurrent repeats reward once", async () => {
  const task = ritual.tasks[0];
  const url = `/api/rituals/today/tasks/${task.id}?timeZone=Asia%2FKolkata`;
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      request(app)
        .put(url)
        .set(auth(tokenA))
        .send({ completed: true, userId: b.id, growthAwarded: 999 }),
    ),
  );
  assert.ok(results.every((r) => r.status === 200));
  const saved = await Ritual.findById(ritual._id);
  assert.equal(saved.growthAwarded, 3);
  assert.equal(saved.tasks[0].completed, true);
  assert.ok(saved.tasks[0].completedAt);
  const stamp = saved.tasks[0].completedAt.toISOString();
  await request(app)
    .put(url)
    .set(auth(tokenA))
    .send({ completed: true })
    .expect(200);
  assert.equal(
    (await Ritual.findById(ritual._id)).tasks[0].completedAt.toISOString(),
    stamp,
  );
  await request(app)
    .put(url)
    .set(auth(tokenA))
    .send({ completed: false })
    .expect(400);
});
test("all three complete award maximum daily care and survive refresh", async () => {
  for (const task of ritual.tasks.slice(1))
    await request(app)
      .put(`/api/rituals/today/tasks/${task.id}?timeZone=Asia%2FKolkata`)
      .set(auth(tokenA))
      .send({ completed: true })
      .expect(200);
  const r = await request(app).get(path).set(auth(tokenA)).expect(200);
  assert.ok(r.body.data.ritual.tasks.every((t) => t.completed));
  assert.equal(r.body.data.ritual.growthAwarded, 9);
  assert.equal(r.body.data.ritualGrowthPoints, 12);
});
test("forged ownership and copied task IDs cannot access another account", async () => {
  const r = await request(app)
    .get(`${path}&userId=${a.id}`)
    .set(auth(tokenB))
    .expect(200);
  assert.equal(r.body.data.ritual.userId, b.id);
  assert.equal(r.body.data.ritual.growthAwarded, 0);
  await request(app)
    .put(
      `/api/rituals/today/tasks/${ritual.tasks[0].id}?timeZone=Asia%2FKolkata`,
    )
    .set(auth(tokenB))
    .send({ completed: true, userId: a.id })
    .expect(404);
  await request(app)
    .put("/api/rituals/today/tasks/missing?timeZone=UTC")
    .set(auth(tokenA))
    .send({ completed: true })
    .expect(404);
  assert.equal((await Ritual.findById(ritual._id)).growthAwarded, 9);
});
test("missing or malformed timezone and completion payload rejected", async () => {
  for (const url of [
    "/api/rituals/today",
    "/api/rituals/today?timeZone=invalid",
    "/api/rituals/today?timeZone=UTC&timeZone=Asia/Kolkata",
  ])
    await request(app).get(url).set(auth(tokenA)).expect(400);
  await request(app)
    .put(`/api/rituals/today/tasks/${ritual.tasks[0].id}?timeZone=UTC`)
    .set(auth(tokenA))
    .send({ completed: "true" })
    .expect(400);
});

test("retrying a prior-day task cannot award growth on the current day", async () => {
  const yesterday = localDay("UTC", new Date(Date.now() - 86400000));
  const previous = await ensureToday(a.id, yesterday);
  const staleTaskId = previous.tasks[0].id;
  const current = await request(app)
    .get("/api/rituals/today?timeZone=UTC")
    .set(auth(tokenA))
    .expect(200);
  await request(app)
    .put(`/api/rituals/today/tasks/${staleTaskId}?timeZone=UTC`)
    .set(auth(tokenA))
    .send({ completed: true })
    .expect(404);
  const afterRetry = await Ritual.findById(current.body.data.ritual._id);
  assert.equal(afterRetry.growthAwarded, current.body.data.ritual.growthAwarded);
  assert.deepEqual(
    afterRetry.tasks.map((task) => task.completed),
    current.body.data.ritual.tasks.map((task) => task.completed),
  );
  assert.equal((await Ritual.findById(previous._id)).growthAwarded, previous.growthAwarded);
});
