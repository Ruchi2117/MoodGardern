import mongoose from "mongoose";
import MoodEntry from "../models/MoodEntry.js";
import User from "../models/User.js";
import { httpError } from "../utils/auth.js";
import {
  MOODS,
  ACTIVITIES,
  MOOD_PLANTS,
  NOTE_MAX_LENGTH,
  GROWTH_PER_ENTRY,
} from "../../../shared/moods.js";

function validateEntry(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw httpError(400, "Please send a mood check-in.");
  const fields = {};
  if (!partial || "mood" in body) {
    if (typeof body.mood !== "string" || !MOODS.includes(body.mood))
      throw httpError(400, "Please choose a valid mood.");
    fields.mood = body.mood;
  }
  if (!partial || "energy" in body) {
    if (
      typeof body.energy !== "number" ||
      !Number.isInteger(body.energy) ||
      body.energy < 1 ||
      body.energy > 5
    )
      throw httpError(400, "Energy must be a whole number from 1 to 5.");
    fields.energy = body.energy;
  }
  if ("note" in body) {
    if (typeof body.note !== "string" || body.note.length > NOTE_MAX_LENGTH)
      throw httpError(
        400,
        `Keep your thought within ${NOTE_MAX_LENGTH} characters.`,
      );
    fields.note = body.note.trim();
  }
  if ("activities" in body) {
    if (
      !Array.isArray(body.activities) ||
      body.activities.length > ACTIVITIES.length ||
      body.activities.some(
        (activity) =>
          typeof activity !== "string" || !ACTIVITIES.includes(activity),
      )
    )
      throw httpError(400, "Please choose valid activities.");
    fields.activities = [...new Set(body.activities)];
  }
  if (partial && !Object.keys(fields).length)
    throw httpError(400, "Please include a field to update.");
  return fields;
}
function entryQuery(request) {
  if (!mongoose.isObjectIdOrHexString(request.params.id))
    throw httpError(400, "That feeling ID is invalid.");
  return { _id: request.params.id, userId: request.user.id };
}
function gardenUpdate(entry) {
  return {
    plantType: MOOD_PLANTS[entry.mood].plantType,
    mood: entry.mood,
    growthPoints: GROWTH_PER_ENTRY,
  };
}
export async function createMood(request, response) {
  const fields = validateEntry(request.body);
  if (!(await User.exists({ _id: request.user.id })))
    throw httpError(401, "Please log in again.");
  const clientRequestId = request.body.clientRequestId;
  if (
    clientRequestId !== undefined &&
    (typeof clientRequestId !== "string" ||
      !/^[A-Za-z0-9_-]{8,128}$/.test(clientRequestId))
  )
    throw httpError(400, "Please send a valid client request ID.");
  const query = { userId: request.user.id, clientRequestId };
  function replay(existing) {
    const sameInput =
      existing.mood === fields.mood &&
      existing.energy === fields.energy &&
      existing.note === (fields.note || "") &&
      JSON.stringify(existing.activities) ===
        JSON.stringify(fields.activities || []);
    if (!sameInput)
      throw httpError(
        409,
        "This request ID was already used for a different feeling.",
      );
    return response.json({
      data: { entry: existing, gardenUpdate: gardenUpdate(existing) },
    });
  }
  if (clientRequestId) {
    const existing = await MoodEntry.findOne(query);
    if (existing) return replay(existing);
  }
  let entry;
  try {
    entry = await MoodEntry.create({
      ...fields,
      userId: request.user.id,
      ...(clientRequestId ? { clientRequestId } : {}),
    });
  } catch (error) {
    // Concurrent retries can both reach create; the unique index chooses one winner.
    if (clientRequestId && error.code === 11000) {
      const existing = await MoodEntry.findOne(query);
      if (existing) return replay(existing);
    }
    throw error;
  }
  response
    .status(201)
    .json({ data: { entry, gardenUpdate: gardenUpdate(entry) } });
}
export async function listMoods(request, response) {
  const entries = await MoodEntry.find({ userId: request.user.id }).sort({
    createdAt: 1,
    _id: 1,
  });
  response.json({
    data: { entries, growthPoints: entries.length * GROWTH_PER_ENTRY },
  });
}
export async function getMood(request, response) {
  const entry = await MoodEntry.findOne(entryQuery(request));
  if (!entry) throw httpError(404, "That feeling could not be found.");
  response.json({ data: { entry } });
}
export async function updateMood(request, response) {
  const query = entryQuery(request);
  const fields = validateEntry(request.body, true);
  const entry = await MoodEntry.findOneAndUpdate(
    query,
    { $set: fields },
    { returnDocument: "after", runValidators: true },
  );
  if (!entry) throw httpError(404, "That feeling could not be found.");
  response.json({ data: { entry, gardenUpdate: gardenUpdate(entry) } });
}
export async function deleteMood(request, response) {
  const entry = await MoodEntry.findOneAndDelete(entryQuery(request));
  if (!entry) throw httpError(404, "That feeling could not be found.");
  response.json({ data: { deletedId: entry.id } });
}
