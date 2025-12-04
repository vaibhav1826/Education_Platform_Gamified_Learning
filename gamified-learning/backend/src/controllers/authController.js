import { OAuth2Client } from 'google-auth-library';
import validator from 'validator';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import { generateTokens, attachRefreshToken, clearRefreshToken } from '../utils/token.js';
import { applyGamificationEvent } from '../utils/gamification.js';

const ROLE_OPTIONS = ['student', 'teacher'];
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const buildAuthResponse = (user, tokens) => ({
  user: user.safeObject ? user.safeObject() : user,
  ...tokens
});

const assertRoleSelection = (role) => {
  if (!ROLE_OPTIONS.includes(role)) {
    const error = new Error(`Role must be one of: ${ROLE_OPTIONS.join(', ')}`);
    error.status = 400;
    throw error;
  }
};

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  assertRoleSelection(role);

  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
    return res.status(400).json({ message: 'Password must include upper, lower case letters and numbers.' });
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'Account already exists. Use login or Google sign-in.' });
  }

  const user = await User.create({
    name: name?.trim(),
    email: normalizedEmail,
    password,
    role,
    authProvider: 'credentials'
  });

  const tokens = generateTokens(user);
  await attachRefreshToken(res, user, tokens.refreshToken);
  await applyGamificationEvent(user, 'daily_login');
  res.status(201).json(buildAuthResponse(user, tokens));
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: normalizeEmail(email) }).populate('badges');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.authProvider !== 'credentials') {
    return res.status(400).json({ message: 'Use Google sign-in for this account.' });
  }

  await applyGamificationEvent(user, 'daily_login');
  const tokens = generateTokens(user);
  await attachRefreshToken(res, user, tokens.refreshToken);
  res.json(buildAuthResponse(user, tokens));
};

export const googleAuth = async (req, res) => {
  if (!googleClient) {
    return res.status(500).json({ message: 'Google OAuth not configured.' });
  }
  const { credential, role } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Missing Google credential.' });
  }

  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
  const payload = ticket.getPayload();
  const normalizedEmail = normalizeEmail(payload.email);
  let user = await User.findOne({ email: normalizedEmail }).populate('badges');

  if (user) {
    if (user.authProvider !== 'google') {
      return res.status(400).json({ message: 'This email is tied to password login.' });
    }
    if (role && user.role !== role) {
      return res.status(409).json({ message: `Account already registered as ${user.role}.` });
    }
  } else {
    assertRoleSelection(role);
    user = await User.create({
      name: payload.name,
      email: normalizedEmail,
      googleId: payload.sub,
      avatar: payload.picture,
      role,
      authProvider: 'google'
    });
  }

  await applyGamificationEvent(user, 'daily_login');
  const tokens = generateTokens(user);
  await attachRefreshToken(res, user, tokens.refreshToken);
  res.json(buildAuthResponse(user, tokens));
};

export const refresh = async (req, res) => {
  const tokens = generateTokens(req.user);
  await attachRefreshToken(res, req.user, tokens.refreshToken);
  res.json(buildAuthResponse(req.user, tokens));
};

export const logout = async (req, res) => {
  await clearRefreshToken(res, req.user);
  res.json({ message: 'Logged out' });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user._id).populate('badges');
  res.json(user?.safeObject ? user.safeObject() : user);
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
