import { Router } from 'express';
import { getLesson } from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:id', protect, getLesson);

export default router;