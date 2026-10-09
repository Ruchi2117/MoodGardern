import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getToday, completeTask } from "../controllers/ritualController.js";
const router = Router();
router.use(requireAuth);
router.get("/today", getToday);
router.put("/today/tasks/:taskId", completeTask);
export default router;
