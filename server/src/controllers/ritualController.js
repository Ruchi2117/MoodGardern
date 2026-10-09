import Ritual from "../models/Ritual.js";
import User from "../models/User.js";
import {
  localDay,
  ensureToday,
  ritualGrowth,
} from "../services/ritualService.js";
import { GROWTH_PER_RITUAL } from "../../../shared/growth.js";
import { httpError } from "../utils/auth.js";
async function today(req) {
  if (!(await User.exists({ _id: req.user.id })))
    throw httpError(401, "Please log in again.");
  return ensureToday(req.user.id, localDay(req.query.timeZone));
}
async function send(res, ritual) {
  res.json({
    data: { ritual, ritualGrowthPoints: await ritualGrowth(ritual.userId) },
  });
}
export async function getToday(req, res) {
  await send(res, await today(req));
}
export async function completeTask(req, res) {
  if (req.body?.completed !== true)
    throw httpError(400, "Rituals stay done for today. Send completed: true.");
  const ritual = await today(req);
  const taskId = req.params.taskId;
  if (!ritual.tasks.some((task) => task.id === taskId))
    throw httpError(404, "That little ritual could not be found.");
  // Completion and reward are one atomic document update, safe for retries and races.
  const updated = await Ritual.findOneAndUpdate(
    {
      _id: ritual._id,
      userId: req.user.id,
      tasks: { $elemMatch: { id: taskId, completed: false } },
    },
    {
      $set: { "tasks.$.completed": true, "tasks.$.completedAt": new Date() },
      $inc: { growthAwarded: GROWTH_PER_RITUAL },
    },
    { returnDocument: "after" },
  );
  await send(
    res,
    updated || (await Ritual.findOne({ _id: ritual._id, userId: req.user.id })),
  );
}
