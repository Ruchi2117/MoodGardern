import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";
import User from "../src/models/User.js";
import MoodEntry from "../src/models/MoodEntry.js";
import { MOOD_PLANTS, MOODS } from "../../shared/moods.js";
const app = createApp();
let database, userA, userB, tokenA, tokenB, entryId;
const input = {
  mood: "happy",
  note: "Had a really good day.",
  activities: ["friends", "exercise"],
  energy: 4,
};
const auth = (token) => ({ Authorization: `Bearer ${token}` });
before(async () => {
  process.env.JWT_SECRET = "moods-test-secret-at-least-thirty-two-characters";
  database = await MongoMemoryServer.create();
  await connectDatabase(database.getUri("moods_test"));
  [userA, userB] = await User.create([
    { name: "A", email: "a@example.com", passwordHash: "test-only" },
    { name: "B", email: "b@example.com", passwordHash: "test-only" },
  ]);
  const sign = (user) =>
    jwt.sign({}, process.env.JWT_SECRET, {
      subject: user.id,
      issuer: "moodgarden",
      audience: "moodgarden-web",
      expiresIn: "1h",
    });
  tokenA = sign(userA);
  tokenB = sign(userB);
});
after(async () => {
  await mongoose.disconnect();
  await database?.stop();
});
test("every mood endpoint requires authentication", async () => {
  const id = new mongoose.Types.ObjectId().toString();
  for (const [method, path] of [
    ["post", "/api/moods"],
    ["get", "/api/moods"],
    ["get", `/api/moods/${id}`],
    ["put", `/api/moods/${id}`],
    ["delete", `/api/moods/${id}`],
  ])
    await request(app)[method](path).send(input).expect(401);
  await request(app).get("/api/moods").set(auth("invalid")).expect(401);
});
test("empty user has an empty garden", async () => {
  const result = await request(app)
    .get("/api/moods")
    .set(auth(tokenB))
    .expect(200);
  assert.deepEqual(result.body.data, { entries: [], growthPoints: 0 });
});
test("create persists input and derives ownership, ignoring a forged userId", async () => {
  const result = await request(app)
    .post("/api/moods")
    .set(auth(tokenA))
    .send({ ...input, userId: userB.id, createdAt: "2000-01-01" })
    .expect(201);
  const { entry, gardenUpdate } = result.body.data;
  entryId = entry._id;
  assert.equal(entry.userId, userA.id);
  assert.equal(entry.note, input.note);
  assert.equal(entry.energy, 4);
  assert.deepEqual(entry.activities, input.activities);
  assert.deepEqual(gardenUpdate, {
    plantType: "sunflower",
    mood: "happy",
    growthPoints: 10,
  });
  assert.equal((await MoodEntry.findById(entryId)).note, input.note);
  assert.notEqual(new Date(entry.createdAt).getFullYear(), 2000);
});
test("invalid mood, energy, activities, note, and missing values return 400", async () => {
  for (const invalid of [
    { mood: "angry" },
    { mood: null },
    { mood: {} },
    { mood: undefined },
    { energy: 0 },
    { energy: 6 },
    { energy: 2.5 },
    { energy: "4" },
    { energy: undefined },
    { activities: ["invalid"] },
    { activities: {} },
    { activities: [{}] },
    { note: {} },
    { note: "x".repeat(2001) },
  ]) {
    await request(app)
      .post("/api/moods")
      .set(auth(tokenA))
      .send({ ...input, ...invalid })
      .expect(400);
  }
  await request(app)
    .post("/api/moods")
    .set(auth(tokenA))
    .set("Content-Type", "application/json")
    .send("{")
    .expect(400);
});
test("each mood returns its shared plant mapping; optional fields default safely", async () => {
  for (const mood of MOODS) {
    const result = await request(app)
      .post("/api/moods")
      .set(auth(tokenA))
      .send({ mood, energy: 3 })
      .expect(201);
    assert.equal(
      result.body.data.gardenUpdate.plantType,
      MOOD_PLANTS[mood].plantType,
    );
    assert.equal(result.body.data.entry.note, "");
    assert.deepEqual(result.body.data.entry.activities, []);
  }
});
test("list and read expose only the owner’s entries, even with forged query", async () => {
  const mine = await request(app)
    .get("/api/moods")
    .set(auth(tokenA))
    .expect(200);
  assert.equal(mine.body.data.entries.length, 8);
  assert.equal(mine.body.data.growthPoints, 80);
  assert.ok(mine.body.data.entries.every((entry) => entry.userId === userA.id));
  const other = await request(app)
    .get(`/api/moods?userId=${userA.id}`)
    .set(auth(tokenB))
    .expect(200);
  assert.deepEqual(other.body.data.entries, []);
  await request(app).get(`/api/moods/${entryId}`).set(auth(tokenA)).expect(200);
  await request(app).get(`/api/moods/${entryId}`).set(auth(tokenB)).expect(404);
});
test("owner can edit; another account cannot edit or transfer ownership", async () => {
  await request(app)
    .put(`/api/moods/${entryId}`)
    .set(auth(tokenB))
    .send({ mood: "sad" })
    .expect(404);
  const result = await request(app)
    .put(`/api/moods/${entryId}`)
    .set(auth(tokenA))
    .send({ mood: "calm", note: "Taking things slowly.", userId: userB.id })
    .expect(200);
  assert.equal(result.body.data.entry.mood, "calm");
  assert.equal(result.body.data.entry.userId, userA.id);
  assert.equal(result.body.data.gardenUpdate.plantType, "lavender");
  await request(app)
    .put(`/api/moods/${entryId}`)
    .set(auth(tokenA))
    .send({ energy: 9 })
    .expect(400);
  await request(app)
    .put(`/api/moods/${entryId}`)
    .set(auth(tokenA))
    .send({ activities: ["bad"] })
    .expect(400);
  await request(app)
    .put(`/api/moods/${entryId}`)
    .set(auth(tokenA))
    .send({})
    .expect(400);
});
test("malformed and missing IDs are handled consistently", async () => {
  for (const method of ["get", "put", "delete"]) {
    await request(app)
      [method]("/api/moods/not-an-id")
      .set(auth(tokenA))
      .send({ mood: "happy" })
      .expect(400);
    await request(app)
      [method](`/api/moods/${new mongoose.Types.ObjectId()}`)
      .set(auth(tokenA))
      .send({ mood: "happy" })
      .expect(404);
  }
});
test("another account cannot delete; owner deletion removes the entry", async () => {
  await request(app)
    .delete(`/api/moods/${entryId}`)
    .set(auth(tokenB))
    .expect(404);
  assert.ok(await MoodEntry.findById(entryId));
  await request(app)
    .delete(`/api/moods/${entryId}`)
    .set(auth(tokenA))
    .expect(200);
  assert.equal(await MoodEntry.findById(entryId), null);
  await request(app).get(`/api/moods/${entryId}`).set(auth(tokenA)).expect(404);
});
import { randomUUID } from "node:crypto";
test("idempotent creation replays safely, supports new intents, and scopes keys per user", async () => {
  await MoodEntry.init();
  const clientRequestId = randomUUID();
  const payload = { ...input, clientRequestId };
  const first = await request(app)
    .post("/api/moods")
    .set(auth(tokenA))
    .send(payload)
    .expect(201);
  const repeated = await request(app)
    .post("/api/moods")
    .set(auth(tokenA))
    .send(payload)
    .expect(200);
  assert.equal(first.body.data.entry._id, repeated.body.data.entry._id);
  assert.equal(
    await MoodEntry.countDocuments({ userId: userA.id, clientRequestId }),
    1,
  );
  await request(app)
    .post("/api/moods")
    .set(auth(tokenA))
    .send({ ...payload, note: "Changed intention" })
    .expect(409);
  await request(app)
    .post("/api/moods")
    .set(auth(tokenA))
    .send({ ...payload, clientRequestId: randomUUID() })
    .expect(201);
  await request(app)
    .post("/api/moods")
    .set(auth(tokenB))
    .send(payload)
    .expect(201);
  assert.equal(await MoodEntry.countDocuments({ clientRequestId }), 2);
});
test("concurrent identical retries insert only one entry", async () => {
  const clientRequestId = randomUUID();
  const responses = await Promise.all(
    Array.from({ length: 5 }, () =>
      request(app)
        .post("/api/moods")
        .set(auth(tokenA))
        .send({ ...input, clientRequestId }),
    ),
  );
  assert.ok(responses.every((result) => [200, 201].includes(result.status)));
  assert.equal(
    new Set(responses.map((result) => result.body.data.entry._id)).size,
    1,
  );
  assert.equal(
    await MoodEntry.countDocuments({ userId: userA.id, clientRequestId }),
    1,
  );
});
test("invalid request IDs are rejected and update cannot replace the idempotency key", async () => {
  for (const clientRequestId of [null, {}, "", "x", "x".repeat(129)])
    await request(app)
      .post("/api/moods")
      .set(auth(tokenA))
      .send({ ...input, clientRequestId })
      .expect(400);
  const key = randomUUID();
  const result = await request(app)
    .post("/api/moods")
    .set(auth(tokenA))
    .send({ ...input, clientRequestId: key })
    .expect(201);
  const updated = await request(app)
    .put(`/api/moods/${result.body.data.entry._id}`)
    .set(auth(tokenA))
    .send({ note: "Edited", clientRequestId: randomUUID() })
    .expect(200);
  assert.equal(updated.body.data.entry.clientRequestId, key);
});
