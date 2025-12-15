
import validator from 'validator';
import crypto from 'crypto';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import { generateTokens, attachRefreshToken, clearRefreshToken } from '../utils/token.js';
import { applyGamificationEvent } from '../utils/gamification.js';
import { sendMail } from '../utils/email.js';

// Authentication Controller
// This controller handles all user authentication flows including:
// 1. Traditional Email/Password Signup & Login
// 2. JWT Token Management (Access + Refresh Tokens)
// 3. Password Reset flows

const ROLE_OPTIONS = ['student', 'teacher', 'admin'];
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'dev-admin-secret';

// Helper: standardize email storage to lowercase to prevent duplicates
const normalizeEmail = (email = '') => email.trim().toLowerCase();

// Helper: formatting the response to send back to the client
// We purposefully exclude sensitive data like passwords (handled by safeObject)
const buildAuthResponse = (user, tokens) => ({
  user: user.safeObject ? user.safeObject() : user,
  ...tokens
});

// Helper: Ensure the requested role is valid to prevent injection of unknown roles
const assertRoleSelection = (role) => {
  if (!ROLE_OPTIONS.includes(role)) {
    const error = new Error(`Role must be one of: ${ROLE_OPTIONS.join(', ')}`);
    error.status = 400;
    throw error;
  }
};

/**
 * SIGNUP HANDLER
 * Creates a new user account.
 * 
 * Logic Flow:
 * 1. Validate role-specific requirements (Teachers need specialization, Admins need secret key).
 * 2. Enforce strong password policies for security.
 * 3. Check if email already exists to prevent duplicates.
 * 4. Create user in DB (Password hashing happens in User model pre-save hook).
 * 5. Generate JWT tokens and attach refresh token to HTTP-only cookie.
 * 6. Award 'daily_login' XP immediately to encourage engagement.
 */
export const signup = async (req, res) => {
  const { name, email, password, role, city, phone, avatar, profileImage, specialization, experience, secretKey } =
    req.body;
  assertRoleSelection(role);

  // Security: Enforce minimum length
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  // Security: Enforce complexity (Upper, Lower, Numbers)
  if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
    return res.status(400).json({ message: 'Password must include upper, lower case letters and numbers.' });
  }

  // Teacher Validation: specific fields required for teacher profile quality
  if (role === 'teacher') {
    if (!specialization || typeof specialization !== 'string') {
      return res.status(400).json({ message: 'Specialization is required for teachers.' });
    }
    if (experience === undefined || experience === null || Number.isNaN(Number(experience))) {
      return res.status(400).json({ message: 'Experience is required for teachers.' });
    }
  }

  // Admin Security: Verify secret key to prevent unauthorized admin creation
  if (role === 'admin') {
    if (!secretKey || secretKey !== ADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid admin secret key.' });
    }
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'Account already exists.' });
  }

  const image = (profileImage || avatar)?.trim();

  const user = await User.create({
    name: name?.trim(),
    email: normalizedEmail,
    password,
    role,
    city: city?.trim() || undefined,
    phone: phone?.trim() || undefined,
    specialization: specialization?.trim() || undefined,
    experience: experience !== undefined && experience !== null ? Number(experience) : undefined,
    avatar: image || undefined, // Support both naming conventions
    profileImage: image || undefined,
  });

  // Authentication success setup
  const tokens = generateTokens(user);
  await attachRefreshToken(res, user, tokens.refreshToken);

  // Gamification: Give them a warm welcome with some XP!
  await applyGamificationEvent(user, 'daily_login');

  res.status(201).json(buildAuthResponse(user, tokens));
};

/**
 * LOGIN HANDLER
 * Authenticates an existing user.
 * 
 * Logic Flow:
 * 1. Find user by email.
 * 2. Verify password using bcrypt (via user.matchPassword).
 * 3. Verify role matches (prevent a student from logging in as a teacher if they somehow have both).
 * 4. Check if account is active.
 * 5. Issue new tokens.
 */
export const login = async (req, res) => {
  const { email, password, role } = req.body;
  assertRoleSelection(role);

  // 1. Fetch user + badges (for frontend display)
  const user = await User.findOne({ email: normalizeEmail(email) }).populate('badges');

  // 2. Validate credentials
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // 3. Role enforcement
  if (user.role !== role) {
    return res.status(400).json({ message: `Account is registered as ${user.role}. Please switch role.` });
  }

  // 4. Status check
  if (user.status === 'inactive') {
    return res.status(403).json({ message: 'Account inactive. Contact admin.' });
  }

  // 5. Success - Award daily login XP and generate tokens
  await applyGamificationEvent(user, 'daily_login');
  const tokens = generateTokens(user);
  await attachRefreshToken(res, user, tokens.refreshToken);
  res.json(buildAuthResponse(user, tokens));
};



/**
 * REFRESH TOKEN HANDLER
 * Uses the HttpOnly cookie's refresh token to issue a new Access Token.
 * This allows the user to stay logged in without storing the sensitive access token strictly in local storage for long periods.
 */
export const refresh = async (req, res) => {
  // req.user is already populated by the refreshGuard middleware
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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  // Always return success message for security (don't reveal if email exists)
  const successMessage = { message: 'If an account exists with this email, a password reset link will be sent.' };

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.json(successMessage);
  }

  // Users who signed up with Google can't reset password


  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save hashed token and expiry (1 hour)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  // Build reset URL
  const clientUrl = process.env.CLIENT_URL || process.env.CLIENT_URLS?.split(',')[0] || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  // Send email
  try {
    await sendMail({
      to: user.email,
      subject: 'Password Reset Request - Gamified Learning',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;">Reset Password</a></p>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
  } catch (err) {
    console.error('Email send error:', err);
    // Log the reset URL for development when email is not configured
    console.log('Password reset link (dev):', resetUrl);
  }

  res.json(successMessage);
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
    return res.status(400).json({ message: 'Password must include upper, lower case letters and numbers.' });
  }

  // Hash the token from URL to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  // Update password and clear reset fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in with your new password.' });
};
