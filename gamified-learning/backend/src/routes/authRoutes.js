import { Router } from 'express';
import { signup, login, refresh, logout, me, seedBadges } from '../controllers/authController.js';
import { protect, authorize, refreshGuard } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshGuard, refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.post('/seed/badges', protect, authorize('admin'), seedBadges);

export default router;