import mongoose from "mongoose";
import MoodEntry from "../models/MoodEntry.js";
import Ritual from "../models/Ritual.js";
import { MOODS, MOOD_PLANTS } from "../../../shared/moods.js";
import { localDay } from "./ritualService.js";
import { httpError } from "../utils/auth.js";
export function shiftDay(date, offset) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}
export function currentStreak(days, today) {
  const seen = new Set(days);
  let day = seen.has(today) ? today : shiftDay(today, -1),
    count = 0;
  while (seen.has(day)) {
    count++;
    day = shiftDay(day, -1);
  }
  return count;
}
export async function computeInsights(
  userId,
  timeZone,
  period = "30",
  now = new Date(),
) {
  if (!["7", "30", "all"].includes(period))
    throw httpError(400, "Choose 7 days, 30 days, or all time.");
  const today = localDay(timeZone, now);
  const start = period === "all" ? null : shiftDay(today, 1 - Number(period));
  const timelineStart = shiftDay(today, -29);
  const owner = new mongoose.Types.ObjectId(userId);
  const validEnergy = {
    $and: [
      { $isNumber: "$energy" },
      { $gte: ["$energy", 1] },
      { $lte: ["$energy", 5] },
    ],
  };
  const scoped = [
    { $match: { day: { $lte: today, ...(start ? { $gte: start } : {}) } } },
  ];
  const [result] = await MoodEntry.aggregate([
    { $match: { userId: owner, createdAt: { $lte: now } } },
    {
      $project: {
        mood: 1,
        energy: 1,
        createdAt: 1,
        day: {
          $dateToString: {
            date: "$createdAt",
            format: "%Y-%m-%d",
            timezone: timeZone,
          },
        },
      },
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        days: [{ $group: { _id: "$day" } }],
        summary: [
          ...scoped,
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              average: { $avg: { $cond: [validEnergy, "$energy", null] } },
              energyCount: { $sum: { $cond: [validEnergy, 1, 0] } },
            },
          },
        ],
        distribution: [
          ...scoped,
          { $group: { _id: "$mood", count: { $sum: 1 } } },
        ],
        highEnergyDays: [
          ...scoped,
          { $match: { energy: { $gte: 4, $lte: 5 } } },
          { $group: { _id: "$day" } },
          { $count: "count" },
        ],
        timeline: [
          ...scoped,
          { $match: { day: { $gte: timelineStart } } },
          { $sort: { createdAt: 1, _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$day",
              recordedAt: "$createdAt",
              mood: 1,
              energy: { $cond: [validEnergy, "$energy", null] },
            },
          },
        ],
      },
    },
  ]);
  const [care] = await Ritual.aggregate([
    {
      $match: {
        userId: owner,
        date: { $lte: today, ...(start ? { $gte: start } : {}) },
      },
    },
    { $unwind: "$tasks" },
    { $match: { "tasks.completed": true } },
    { $count: "count" },
  ]);
  const summary = result.summary[0];
  const totalCheckIns = summary?.total || 0;
  const counts = new Map(
    result.distribution.map((item) => [item._id, item.count]),
  );
  const moodDistribution = MOODS.map((mood) => ({
    mood,
    count: counts.get(mood) || 0,
  }));
  const max = Math.max(0, ...moodDistribution.map((item) => item.count));
  const mostCommonMoods = max
    ? moodDistribution
        .filter((item) => item.count === max)
        .map((item) => item.mood)
    : [];
  const streak = currentStreak(
    result.days.map((item) => item._id),
    today,
  );
  const periodLabel = period === "all" ? "across all time" : `in the last ${period} days`;
  const observations = [];
  if (totalCheckIns) {
    observations.push(
      `You’ve checked in ${totalCheckIns} ${totalCheckIns === 1 ? "time" : "times"} ${periodLabel}.`,
    );
    if (mostCommonMoods.length === 1)
      observations.push(
        `${MOOD_PLANTS[mostCommonMoods[0]].name} has been your most common recorded feeling in this period.`,
      );
    else
      observations.push(
        `${mostCommonMoods.map((mood) => MOOD_PLANTS[mood].name).join(", ")} are tied as your most common recorded feelings.`,
      );
    const high = result.highEnergyDays[0]?.count || 0;
    if (high)
      observations.push(
        `You recorded ${high} ${high === 1 ? "day" : "days"} with an energy level of 4 or higher in this period.`,
      );
    if (streak > 1)
      observations.push(
        `You’ve planted a feeling on ${streak} consecutive calendar days.`,
      );
  }
  return {
    period,
    timeZone,
    today,
    start,
    timelineStart,
    timelineSevenStart: shiftDay(today, -6),
    summary: {
      totalCheckIns,
      mostCommonMood: mostCommonMoods.length === 1 ? mostCommonMoods[0] : null,
      mostCommonMoods,
      averageEnergy:
        summary?.average == null ? null : Math.round(summary.average * 10) / 10,
      energySampleCount: summary?.energyCount || 0,
      currentStreak: streak,
    },
    moodDistribution,
    timeline: result.timeline,
    rituals: { completedCount: care?.count || 0 },
    garden: { totalPlanted: result.total[0]?.count || 0 },
    observations,
  };
}
