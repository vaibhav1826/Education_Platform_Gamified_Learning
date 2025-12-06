import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import { signup, login, googleAuth, refresh, logout, me, seedBadges } from '../controllers/authController.js';
import { protect, authorize, refreshGuard } from '../middleware/authMiddleware.js';

const router = Router();
const roleValidator = Joi.string().valid('student', 'teacher', 'admin');

router.post(
  '/signup',
  celebrate({
    [Segments.BODY]: Joi.object({
      name: Joi.string().min(2).max(80).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      role: roleValidator.required(),
      city: Joi.string().max(120).allow('', null),
      phone: Joi.string().max(32).allow('', null),
      avatar: Joi.string().uri().max(500).allow('', null),
      profileImage: Joi.string().max(500).allow('', null),
      // role-specific requirements are enforced in the controller to avoid
      // Joi.when()/schema callback incompatibility across versions.
      specialization: Joi.string().max(200).allow('', null),
      experience: Joi.number().min(0).allow(null),
      secretKey: Joi.string().allow('', null)
    })
  }),
  signup
);

router.post(
  '/login',
  celebrate({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: roleValidator.required()
    })
  }),
  login
);

router.post(
  '/google',
  celebrate({
    [Segments.BODY]: Joi.object({
      credential: Joi.string().required(),
      role: roleValidator
    })
  }),
  googleAuth
);
router.post('/refresh', refreshGuard, refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.post('/seed/badges', protect, authorize('admin'), seedBadges);

export default router;