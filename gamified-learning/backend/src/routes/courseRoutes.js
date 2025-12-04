import { Router } from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  createLesson,
  enrollInCourse,
  getCourseRoster,
  getCourseAnalytics,
  getCourseAnnouncements,
  postAnnouncement
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('teacher', 'admin'), createCourse);

router.route('/:id')
  .get(protect, getCourse)
  .put(protect, authorize('teacher', 'admin'), updateCourse)
  .delete(protect, authorize('teacher', 'admin'), deleteCourse);

router.post('/:id/enroll', protect, authorize('student'), enrollInCourse);
router.get('/:id/roster', protect, authorize('teacher', 'admin'), getCourseRoster);
router.get('/:id/analytics', protect, authorize('teacher', 'admin'), getCourseAnalytics);
router.get('/:id/announcements', protect, getCourseAnnouncements);
router.post('/:id/announcements', protect, authorize('teacher', 'admin'), postAnnouncement);

router.post('/:id/modules', protect, authorize('teacher', 'admin'), createModule);
router.post('/modules/:moduleId/lessons', protect, authorize('teacher', 'admin'), createLesson);

export default router;