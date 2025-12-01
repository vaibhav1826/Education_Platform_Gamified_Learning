import { Router } from 'express';
import { generateCourseCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:courseId', protect, generateCourseCertificate);

export default router;