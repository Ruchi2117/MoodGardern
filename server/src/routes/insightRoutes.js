import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getInsights } from "../controllers/insightController.js";
const router = Router();
router.use(requireAuth);
router.get("/", getInsights);
export default router;
