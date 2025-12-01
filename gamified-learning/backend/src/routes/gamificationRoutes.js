import { Router } from 'express';
import { getProgress, applyEvent } from '../controllers/gamificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/progress', protect, getProgress);
router.post('/event', protect, applyEvent);

export default router;