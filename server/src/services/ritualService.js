import { createHash } from "node:crypto";
import mongoose from "mongoose";
import Ritual from "../models/Ritual.js";
import { RITUAL_DEFINITIONS } from "../../../shared/rituals.js";
import { httpError } from "../utils/auth.js";
export function localDay(timeZone, now = new Date()) {
  if (typeof timeZone !== "string" || timeZone.length > 100)
    throw httpError(400, "Please send your local timezone.");
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const part = (type) => parts.find((p) => p.type === type).value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  } catch {
    throw httpError(400, "Please send a valid IANA timezone.");
  }
}
export function dailyTasks(userId, date) {
  const offset = createHash("sha256")
    .update(String(userId))
    .digest()
    .readUInt32BE(0);
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  return Array.from({ length: 3 }, (_, i) => {
    const { id, title, description } =
      RITUAL_DEFINITIONS[(offset + day + i * 2) % RITUAL_DEFINITIONS.length];
    const key = createHash("sha256")
      .update(`${userId}:${date}:${id}`)
      .digest("hex")
      .slice(0, 24);
    return { id: key, title, description, completed: false, completedAt: null };
  });
}
export async function ensureToday(userId, date) {
  const query = { userId, date };
  try {
    return await Ritual.findOneAndUpdate(
      query,
      {
        $setOnInsert: {
          ...query,
          tasks: dailyTasks(userId, date),
          growthAwarded: 0,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
  } catch (error) {
    if (error.code === 11000) return Ritual.findOne(query);
    throw error;
  }
}
export async function ritualGrowth(userId) {
  const result = await Ritual.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$growthAwarded" } } },
  ]);
  return result[0]?.total || 0;
}
