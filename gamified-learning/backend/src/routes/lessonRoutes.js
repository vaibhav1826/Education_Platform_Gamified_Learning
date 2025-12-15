import { Router } from 'express';
import { getLesson, updateLesson, deleteLesson, completeLesson } from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:id', protect, getLesson);
router.put('/:id', protect, authorize('teacher', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLesson);
router.post('/:id/complete', protect, authorize('student'), completeLesson);

export default router;