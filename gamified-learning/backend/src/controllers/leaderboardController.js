import Leaderboard from '../models/Leaderboard.js';
import { io } from '../utils/socket.js';

// Filter strictly for students
export const getLeaderboard = async (_req, res) => {
  // Fetch a buffer (e.g., 100) to ensure we get 50 students even if some teachers are in the raw list
  const rawBoard = await Leaderboard.find().sort({ xp: -1 }).limit(100).populate('user', 'name profileImage role');

  const board = rawBoard
    .filter(entry => entry.user && entry.user.role === 'student')
    .slice(0, 50);

  res.json(board);
};

export const updateLeaderboard = async (user) => {
  if (user.role !== 'student') return; // Only track students

  const entry = await Leaderboard.findOneAndUpdate(
    { user: user._id },
    { xp: user.xp, level: user.level, badges: user.badges },
    { upsert: true, new: true }
  ).populate('user badges');
  io()?.emit('leaderboard:update', entry);
};