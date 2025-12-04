import { Router } from 'express';
import { getQuiz, createQuiz, addQuestion, assignQuiz, getQuizAttempts, submitQuiz } from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.get('/:id', protect, getQuiz);
router.post('/:id/questions', protect, authorize('teacher', 'admin'), addQuestion);
router.post('/:id/assign', protect, authorize('teacher', 'admin'), assignQuiz);
router.get('/:id/attempts', protect, authorize('teacher', 'admin'), getQuizAttempts);
router.post('/:id/submit', protect, submitQuiz);

export default router;