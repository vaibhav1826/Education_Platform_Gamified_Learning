import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    createAssignment,
    getAssignment,
    submitAssignment,
    getAssignmentSubmissions,
    gradeAssignment
} from '../controllers/assignmentController.js';

const router = Router();

router.use(protect);

router.post('/', authorize('teacher', 'admin'), createAssignment);
router.get('/:id', getAssignment); // Students need to see details
router.post('/:id/submit', authorize('student'), submitAssignment);
router.get('/:id/submissions', authorize('teacher', 'admin'), getAssignmentSubmissions);
router.patch('/submissions/:submissionId/grade', authorize('teacher', 'admin'), gradeAssignment);

export default router;
