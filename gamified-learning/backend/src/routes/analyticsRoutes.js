import { Router } from 'express';
import { getTeacherOverview, getStudentOverview } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherOverview);
router.get('/student', protect, authorize('student'), getStudentOverview);

export default router;

