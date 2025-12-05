import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getDashboard,
  searchStudents,
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  addStudentToBatch,
  removeStudentFromBatch,
  getBatchLeaderboard,
  getGlobalLeaderboard
} from '../controllers/teacherController.js';

const router = Router();

router.use(protect);
router.use(authorize('teacher'));

router.get('/dashboard', getDashboard);
router.get('/students/search', searchStudents);
router.post('/batches', createBatch);
router.get('/batches', getBatches);
router.get('/batches/:id', getBatch);
router.patch('/batches/:id', updateBatch);
router.delete('/batches/:id', deleteBatch);
router.post('/batches/:batchId/students', addStudentToBatch);
router.delete('/batches/:batchId/students/:studentId', removeStudentFromBatch);
router.get('/batches/:id/leaderboard', getBatchLeaderboard);
router.get('/leaderboard/global', getGlobalLeaderboard);

export default router;

