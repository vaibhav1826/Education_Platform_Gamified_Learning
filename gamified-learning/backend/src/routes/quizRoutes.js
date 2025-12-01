import { Router } from 'express';
import { getQuiz, createQuiz, addQuestion, submitQuiz } from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, authorize('admin'), createQuiz);
router.get('/:id', protect, getQuiz);
router.post('/:id/questions', protect, authorize('admin'), addQuestion);
router.post('/:id/submit', protect, submitQuiz);

export default router;