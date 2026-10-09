import User from "../models/User.js";
import { computeInsights } from "../services/insightService.js";
import { httpError } from "../utils/auth.js";
export async function getInsights(req, res) {
  if (!(await User.exists({ _id: req.user.id })))
    throw httpError(401, "Please log in again.");
  const data = await computeInsights(
    req.user.id,
    req.query.timeZone,
    req.query.period ?? "30",
  );
  res.json({ data });
}
