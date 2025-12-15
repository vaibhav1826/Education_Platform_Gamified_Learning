import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  listTeachers,
  listStudents,
  updateUserStatus,
  updateUserRole,
  updateUserProfile,
  listBatches,
  deleteBatch,
  listCourses,
  updateCourseStatus,
  listQuizzes,
  updateQuizStatus,
  deleteQuiz,
  listSubmissions,
  getStudentStats,
  getStudentSubmissions,
  getStudentBatches,
  createAdminAnnouncement,
  getAdminAnnouncementsForRole,
  createAdminNotifications,
  getAdminStudentLeaderboard,
  getAdminTeacherLeaderboard,
  getSettings,
  updateSettings,
  updateAdminOwnProfile,
  changeAdminPassword,
  getAdminAnalytics
} from '../controllers/adminController.js';

const router = Router();

router.use(protect, authorize('admin'));

// Analytics Dashboard
router.get('/analytics', getAdminAnalytics);

// Admin own profile
router.patch('/profile', updateAdminOwnProfile);
router.post('/change-password', changeAdminPassword);

// Users
router.get('/teachers', listTeachers);
router.get('/students', listStudents);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/profile', updateUserProfile);

// Batches & courses
router.get('/batches', listBatches);
router.delete('/batches/:batchId', deleteBatch);
router.get('/courses', listCourses);
router.patch('/courses/:courseId/status', updateCourseStatus);

// Quizzes & submissions
router.get('/quizzes', listQuizzes);
router.patch('/quizzes/:id/status', updateQuizStatus);
router.delete('/quizzes/:id', deleteQuiz);
router.get('/submissions', listSubmissions);

// Student monitoring
router.get('/students/:id/stats', getStudentStats);
router.get('/students/:id/submissions', getStudentSubmissions);
router.get('/students/:id/batches', getStudentBatches);

// Announcements & notifications
router.post('/announcements', createAdminAnnouncement);
router.get('/announcements/:role', getAdminAnnouncementsForRole);
router.post('/notifications', createAdminNotifications);

// Leaderboards
router.get('/leaderboard/students', getAdminStudentLeaderboard);
router.get('/leaderboard/teachers', getAdminTeacherLeaderboard);

// Settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;


