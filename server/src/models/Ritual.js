import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    tasks: { type: [taskSchema], required: true },
    growthAwarded: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
schema.index({ userId: 1, date: 1 }, { unique: true });
export default mongoose.model("Ritual", schema);
