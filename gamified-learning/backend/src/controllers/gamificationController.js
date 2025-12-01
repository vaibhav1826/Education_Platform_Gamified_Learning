import Progress from '../models/Progress.js';
import { applyGamificationEvent, getLevelRequirements } from '../utils/gamification.js';

export const getProgress = async (req, res) => {
  const progress = await Progress.find({ user: req.user._id }).populate('course');
  res.json({ progress, user: req.user, requirements: getLevelRequirements(req.user.level) });
};

export const applyEvent = async (req, res) => {
  const updated = await applyGamificationEvent(req.user, req.body.event, req.body.meta);
  res.json(updated);
};