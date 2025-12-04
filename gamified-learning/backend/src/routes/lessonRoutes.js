import { Router } from 'express';
import { getLesson, completeLesson } from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:id', protect, getLesson);
router.post('/:id/complete', protect, authorize('student'), completeLesson);

export default router;