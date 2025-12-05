import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
  getSubmission
} from '../controllers/quizController.js';

const router = Router();

router.use(protect);
router.use(authorize('teacher'));

router.post('/quizzes', createQuiz);
router.get('/quizzes', getQuizzes);
router.get('/quizzes/:id', getQuiz);
router.patch('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.get('/quizzes/:quizId/submissions', getQuizSubmissions);
router.get('/submissions/:id', getSubmission);

export default router;
