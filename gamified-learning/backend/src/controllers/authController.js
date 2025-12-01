import User from '../models/User.js';
import Badge from '../models/Badge.js';
import { generateTokens, attachRefreshToken, clearRefreshToken } from '../utils/token.js';
import { applyGamificationEvent } from '../utils/gamification.js';

export const signup = async (req, res) => {
  const user = await User.create(req.body);
  const tokens = generateTokens(user);
  await attachRefreshToken(res, user, tokens.refreshToken);
  await applyGamificationEvent(user, 'daily_login');
  res.status(201).json({ user, ...tokens });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate('badges');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  await applyGamificationEvent(user, 'daily_login');
  const tokens = generateTokens(user);
  await attachRefreshToken(res, user, tokens.refreshToken);
  res.json({ user, ...tokens });
};

export const refresh = async (req, res) => {
  const tokens = generateTokens(req.user);
  await attachRefreshToken(res, req.user, tokens.refreshToken);
  res.json({ user: req.user, ...tokens });
};

export const logout = async (req, res) => {
  await clearRefreshToken(res, req.user);
  res.json({ message: 'Logged out' });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user._id).populate('badges');
  res.json(user);
};

export const seedBadges = async (_req, res) => {
  await Badge.deleteMany();
  const badges = await Badge.insertMany([
    { name: '5 Day Streak', description: 'Consistency matters', type: 'streak', criteria: '5_day_streak' },
    { name: '10 Day Streak', description: 'Rare dedication', type: 'rare', criteria: '10_day_streak' },
    { name: 'Quiz Hero', description: 'Perfect quiz score', type: 'achievement', criteria: 'perfect_quiz' }
  ]);
  res.json(badges);
};