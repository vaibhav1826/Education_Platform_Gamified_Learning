import { Router } from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Update profile image URL for the authenticated user
router.patch('/me/profile-image', protect, async (req, res) => {
  const { profileImage } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!profileImage || profileImage.trim() === '') {
    user.profileImage = '';
    user.avatar = '';
  } else {
    user.profileImage = profileImage.trim();
    user.avatar = profileImage.trim();
  }

  await user.save();
  const safe = user.safeObject ? user.safeObject() : user;
  res.json(safe);
});

export default router;


