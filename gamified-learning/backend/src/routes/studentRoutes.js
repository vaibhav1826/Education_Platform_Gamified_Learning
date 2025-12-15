import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getStudentBatches,
  getStudentBatch,
  joinBatchByCode,
  getAssignedQuizzes,
  getStudentQuiz,
  submitQuiz,
  getQuizResult,
  getBatchLeaderboardForStudent,
  getGlobalLeaderboardForStudent,
  getStudentAnnouncements,
  getStudentCourses,
  getStudentCourse,
  getStudentProfile,
  updateStudentProfile,
  updateStudentProfileImage,
  getStudentNotifications
} from '../controllers/studentController.js';

const router = Router();

router.use(protect);
router.use(authorize('student'));

router.get('/batches', getStudentBatches);
router.post('/batches/join', joinBatchByCode);
router.get('/batches/:id', getStudentBatch);
router.get('/batches/:id/leaderboard', getBatchLeaderboardForStudent);

router.get('/quizzes/assigned', getAssignedQuizzes);
router.get('/quizzes/:quizId', getStudentQuiz);
router.post('/quizzes/:quizId/submit', submitQuiz);
router.get('/quizzes/:quizId/result', getQuizResult);

router.get('/leaderboard/global', getGlobalLeaderboardForStudent);

router.get('/announcements', getStudentAnnouncements);

router.get('/courses', getStudentCourses);
router.get('/courses/:id', getStudentCourse);

router.get('/profile', getStudentProfile);
router.patch('/profile', updateStudentProfile);
router.patch('/profile-image', updateStudentProfileImage);

router.get('/notifications', getStudentNotifications);

export default router;


