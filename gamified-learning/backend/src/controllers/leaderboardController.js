import Leaderboard from '../models/Leaderboard.js';
import { io } from '../utils/socket.js';

export const getLeaderboard = async (_req, res) => {
  const board = await Leaderboard.find().sort({ xp: -1 }).limit(50).populate('user badges');
  res.json(board);
};

export const updateLeaderboard = async (user) => {
  const entry = await Leaderboard.findOneAndUpdate(
    { user: user._id },
    { xp: user.xp, level: user.level, badges: user.badges },
    { upsert: true, new: true }
  ).populate('user badges');
  io()?.emit('leaderboard:update', entry);
};