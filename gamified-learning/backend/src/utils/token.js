import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
  const payload = { id: user._id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

export const attachRefreshToken = async (res, user, token) => {
  user.refreshToken = token;
  await user.save();
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearRefreshToken = async (res, user) => {
  user.refreshToken = null;
  await user.save();
  res.clearCookie('refreshToken');
};