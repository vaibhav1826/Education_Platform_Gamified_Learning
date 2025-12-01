import { Router } from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  createLesson
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/')
  .get(protect, getCourses)
  .post(protect, authorize('admin'), createCourse);

router.route('/:id')
  .get(protect, getCourse)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

router.post('/:id/modules', protect, authorize('admin'), createModule);
router.post('/modules/:moduleId/lessons', protect, authorize('admin'), createLesson);

export default router;