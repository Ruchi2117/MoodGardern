import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";
import User from "../src/models/User.js";
import MoodEntry from "../src/models/MoodEntry.js";
import Ritual from "../src/models/Ritual.js";
import {
  computeInsights,
  currentStreak,
  shiftDay,
} from "../src/services/insightService.js";
import { localDay } from "../src/services/ritualService.js";
const app = createApp();
let db, a, b, tokenA, tokenB;
const auth = (t) => ({ Authorization: `Bearer ${t}` });
const path = "/api/insights?timeZone=UTC";
const fixed = new Date("2026-10-08T18:00:00Z");
async function insert(entries, owner = a) {
  await MoodEntry.collection.insertMany(
    entries.map((item) => ({
      userId: owner._id,
      note: "Private journal thought",
      activities: ["friends"],
      createdAt: fixed,
      updatedAt: fixed,
      ...item,
    })),
  );
}
before(async () => {
  process.env.JWT_SECRET =
    "insights-test-secret-at-least-thirty-two-characters";
  db = await MongoMemoryServer.create();
  await connectDatabase(db.getUri("insights_test"));
  [a, b] = await User.create([
    { name: "A", email: "a@insights.test", passwordHash: "test" },
    { name: "B", email: "b@insights.test", passwordHash: "test" },
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
beforeEach(async () => {
  await Promise.all([MoodEntry.deleteMany({}), Ritual.deleteMany({})]);
});
after(async () => {
  await mongoose.disconnect();
  await db?.stop();
});
test("insights reject unauthenticated and invalid tokens", async () => {
  await request(app).get(path).expect(401);
  await request(app).get(path).set(auth("invalid")).expect(401);
});
test("empty account returns honest empty statistics and no observations", async () => {
  const r = await request(app).get(path).set(auth(tokenA)).expect(200);
  const d = r.body.data;
  assert.equal(d.summary.totalCheckIns, 0);
  assert.equal(d.summary.averageEnergy, null);
  assert.deepEqual(d.summary.mostCommonMoods, []);
  assert.equal(d.summary.currentStreak, 0);
  assert.equal(d.garden.totalPlanted, 0);
  assert.equal(d.rituals.completedCount, 0);
  assert.deepEqual(d.timeline, []);
  assert.deepEqual(d.observations, []);
});
test("one mood yields actual statistics and only necessary timeline fields", async () => {
  await insert([{ mood: "calm", energy: 4, createdAt: new Date() }]);
  const r = await request(app).get(path).set(auth(tokenA)).expect(200);
  const d = r.body.data;
  assert.equal(d.summary.totalCheckIns, 1);
  assert.equal(d.summary.mostCommonMood, "calm");
  assert.equal(d.summary.averageEnergy, 4);
  assert.equal(d.summary.currentStreak, 1);
  assert.equal(d.timeline.length, 1);
  assert.deepEqual(Object.keys(d.timeline[0]).sort(), [
    "date",
    "energy",
    "mood",
    "recordedAt",
  ]);
  assert.ok(!JSON.stringify(d).includes("Private journal thought"));
});
test("distribution and averages derive from multiple entries including same day", async () => {
  await insert([
    { mood: "happy", energy: 4 },
    { mood: "happy", energy: 2 },
    { mood: "calm", energy: 5 },
    { mood: "sad", energy: 2 },
  ]);
  const d = await computeInsights(a.id, "UTC", "30", fixed);
  assert.equal(d.summary.totalCheckIns, 4);
  assert.equal(d.summary.averageEnergy, 3.3);
  assert.equal(d.summary.mostCommonMood, "happy");
  assert.equal(d.summary.currentStreak, 1);
  assert.equal(d.moodDistribution.find((i) => i.mood === "happy").count, 2);
  assert.equal(d.moodDistribution.find((i) => i.mood === "tired").count, 0);
  assert.equal(d.timeline.length, 4);
  assert.ok(
    d.observations.some((s) => s.includes("1 day with an energy level of 4")),
  );
});
test("most common ties are explicit rather than choosing an arbitrary winner", async () => {
  await insert([
    { mood: "happy", energy: 3 },
    { mood: "calm", energy: 4 },
  ]);
  const d = await computeInsights(a.id, "UTC", "all", fixed);
  assert.equal(d.summary.mostCommonMood, null);
  assert.deepEqual(d.summary.mostCommonMoods, ["happy", "calm"]);
  assert.ok(d.observations.some((s) => s.includes("tied")));
});
test("legacy missing and invalid energy is excluded from average without losing moods", async () => {
  await insert([
    { mood: "sad" },
    { mood: "calm", energy: null },
    { mood: "happy", energy: 4 },
    { mood: "okay", energy: "5" },
    { mood: "tired", energy: 99 },
  ]);
  const d = await computeInsights(a.id, "UTC", "30", fixed);
  assert.equal(d.summary.totalCheckIns, 5);
  assert.equal(d.summary.energySampleCount, 1);
  assert.equal(d.summary.averageEnergy, 4);
  assert.equal(d.timeline.filter((p) => p.energy === null).length, 4);
  await MoodEntry.deleteMany({});
  await insert([{ mood: "calm" }]);
  assert.equal(
    (await computeInsights(a.id, "UTC", "30", fixed)).summary.averageEnergy,
    null,
  );
});
test("streak counts unique calendar days ending today or yesterday and crosses month/year", async () => {
  assert.equal(
    currentStreak(["2026-10-08", "2026-10-07", "2026-10-06"], "2026-10-08"),
    3,
  );
  assert.equal(currentStreak(["2026-10-07", "2026-10-06"], "2026-10-08"), 2);
  assert.equal(currentStreak(["2026-10-06"], "2026-10-08"), 0);
  assert.equal(
    currentStreak(["2026-01-01", "2025-12-31", "2025-12-30"], "2026-01-01"),
    3,
  );
  await insert([
    { mood: "happy", energy: 3 },
    { mood: "calm", energy: 3 },
    { mood: "sad", energy: 3, createdAt: new Date("2026-10-07T20:00:00Z") },
    { mood: "okay", energy: 3, createdAt: new Date("2026-10-06T20:00:00Z") },
  ]);
  assert.equal(
    (await computeInsights(a.id, "UTC", "7", fixed)).summary.currentStreak,
    3,
  );
});
test("local timezone boundaries affect streak and period inclusion correctly", async () => {
  const now = new Date("2026-10-08T01:00:00Z");
  await insert([
    { mood: "calm", energy: 3, createdAt: new Date("2026-10-08T00:30:00Z") },
    { mood: "happy", energy: 3, createdAt: new Date("2026-10-07T00:30:00Z") },
  ]);
  const west = await computeInsights(a.id, "America/Los_Angeles", "7", now);
  assert.equal(west.today, "2026-10-07");
  assert.deepEqual(
    west.timeline.map((p) => p.date),
    ["2026-10-06", "2026-10-07"],
  );
  assert.equal(west.summary.currentStreak, 2);
  const east = await computeInsights(a.id, "Asia/Kolkata", "7", now);
  assert.equal(east.today, "2026-10-08");
  assert.deepEqual(
    east.timeline.map((p) => p.date),
    ["2026-10-07", "2026-10-08"],
  );
  assert.equal(shiftDay("2026-03-09", -1), "2026-03-08");
  assert.equal(
    localDay("America/New_York", new Date("2026-03-08T07:30:00Z")),
    "2026-03-08",
  );
});
test("7/30/all periods are inclusive calendar windows; timeline stays within last 30 days", async () => {
  await insert([
    { mood: "happy", energy: 3 },
    { mood: "calm", energy: 4, createdAt: new Date("2026-10-02T00:00:00Z") },
    { mood: "sad", energy: 2, createdAt: new Date("2026-10-01T23:59:59Z") },
    { mood: "okay", energy: 3, createdAt: new Date("2026-09-09T00:00:00Z") },
    { mood: "tired", energy: 1, createdAt: new Date("2026-09-08T23:59:59Z") },
    { mood: "loved", energy: 4, createdAt: new Date("2026-10-09T00:00:00Z") },
  ]);
  const week = await computeInsights(a.id, "UTC", "7", fixed),
    month = await computeInsights(a.id, "UTC", "30", fixed),
    all = await computeInsights(a.id, "UTC", "all", fixed);
  assert.equal(week.summary.totalCheckIns, 2);
  assert.equal(month.summary.totalCheckIns, 4);
  assert.equal(all.summary.totalCheckIns, 5);
  assert.equal(all.timeline.length, 4);
  assert.equal(all.garden.totalPlanted, 5);
});
test("ritual insight counts completed tasks only in selected local dates", async () => {
  await Ritual.create([
    {
      userId: a.id,
      date: "2026-10-08",
      tasks: [
        { id: "one", title: "One", description: "Small", completed: true },
        { id: "two", title: "Two", description: "Small", completed: false },
      ],
      growthAwarded: 3,
    },
    {
      userId: a.id,
      date: "2026-09-01",
      tasks: [
        { id: "old", title: "Old", description: "Small", completed: true },
      ],
      growthAwarded: 3,
    },
    {
      userId: b.id,
      date: "2026-10-08",
      tasks: [
        { id: "other", title: "Other", description: "Small", completed: true },
      ],
      growthAwarded: 3,
    },
  ]);
  assert.equal(
    (await computeInsights(a.id, "UTC", "30", fixed)).rituals.completedCount,
    1,
  );
  assert.equal(
    (await computeInsights(a.id, "UTC", "all", fixed)).rituals.completedCount,
    2,
  );
});
test("API ignores forged ownership and validates period/timezone", async () => {
  await insert([{ mood: "happy", energy: 5, createdAt: new Date() }]);
  const r = await request(app)
    .get(`${path}&userId=${a.id}`)
    .set(auth(tokenB))
    .expect(200);
  assert.equal(r.body.data.summary.totalCheckIns, 0);
  assert.deepEqual(r.body.data.timeline, []);
  for (const url of [
    "/api/insights",
    "/api/insights?timeZone=bad",
    `${path}&period=90`,
    `${path}&period=7&period=30`,
  ])
    await request(app).get(url).set(auth(tokenA)).expect(400);
});
