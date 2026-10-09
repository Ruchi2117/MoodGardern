import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { createMood, listMoods, getMood, updateMood, deleteMood } from '../controllers/moodController.js';
const router = Router();
router.use(requireAuth);
router.route('/').post(createMood).get(listMoods);
router.route('/:id').get(getMood).put(updateMood).delete(deleteMood);
export default router;
