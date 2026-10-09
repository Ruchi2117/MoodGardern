import mongoose from "mongoose";
import { MOODS, ACTIVITIES, NOTE_MAX_LENGTH } from "../../../shared/moods.js";
const moodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientRequestId: { type: String, maxlength: 128 },
    mood: { type: String, required: true, enum: MOODS },
    note: { type: String, default: "", maxlength: NOTE_MAX_LENGTH },
    activities: { type: [{ type: String, enum: ACTIVITIES }], default: [] },
    energy: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: Number.isInteger,
    },
  },
  { timestamps: true },
);
moodEntrySchema.index({ userId: 1, createdAt: 1, _id: 1 });
moodEntrySchema.index(
  { userId: 1, clientRequestId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientRequestId: { $type: "string" } },
  },
);
export default mongoose.model("MoodEntry", moodEntrySchema);
