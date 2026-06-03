const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { issueCsrfToken } = require('../middleware/csrf');
const { sendWelcomeEmail } = require('../config/email');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

// ── Cookie options for refresh token ──────────────────────────────
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                                           // JS cannot read this
  secure: process.env.NODE_ENV === 'production',            // HTTPS only in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,                        // 7 days
  path: '/api/auth',                                        // only sent to auth routes
};

// Admin uses a SEPARATE cookie so user+admin can run simultaneously in same browser
const ADMIN_REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

// ── Helper: send tokens + CSRF + user ─────────────────────────────
const sendTokenResponse = (res, statusCode, user, message) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Refresh token → httpOnly cookie — USER cookie (port 3000 / user site)
  res.cookie('pakka_refresh', refreshToken, REFRESH_COOKIE_OPTIONS);

  // Issue CSRF token (readable by JS, sent back as header on mutations)
  const csrfToken = issueCsrfToken(res);

  const safeUser = {
    _id:     user._id,
    name:    user.name,
    email:   user.email,
    phone:   user.phone,
    address: user.address,
    role:    user.role,
  };

  res.status(statusCode).json({
    success:   true,
    message,
    token:     accessToken,   // short-lived access token stored in memory on frontend
    csrfToken,                // send to frontend so it can set X-CSRF-Token header
    user:      safeUser,
  });
};

// ── GET /api/auth/csrf-token ───────────────────────────────────────
const getCsrfToken = asyncHandler(async (req, res) => {
  const token = issueCsrfToken(res);
  res.json({ success: true, csrfToken: token });
});

const sendAdminTokenResponse = (res, statusCode, user, message) => {
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Admin refresh token uses a SEPARATE cookie name — never conflicts with user session
  res.cookie('pakka_admin_refresh', refreshToken, ADMIN_REFRESH_COOKIE_OPTIONS);

  const csrfToken = issueCsrfToken(res);

  const safeUser = {
    _id:     user._id,
    name:    user.name,
    email:   user.email,
    phone:   user.phone,
    address: user.address,
    role:    user.role,
  };

  res.status(statusCode).json({
    success:   true,
    message,
    token:     accessToken,
    csrfToken,
    user:      safeUser,
  });
};

// ── POST /api/auth/register ────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, address } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email:   email.toLowerCase(),
    phone,
    password,
    address: address || {},
    role:    'user',
  });

  sendWelcomeEmail(user.email, user.name).catch(err =>
    logger.error('Welcome email failed', { error: err.message })
  );

  sendTokenResponse(res, 201, user, 'Registration successful!');
});

// ── POST /api/auth/login ───────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');
  if (!user) {
    // Constant-time response — don't reveal if email exists
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Check account lock
  if (user.isLocked) {
    const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(429).json({
      success: false,
      message: `Account temporarily locked. Try again in ${remaining} minute(s).`,
    });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been disabled.' });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Increment failed attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      logger.warn('Account locked after failed attempts', { email: user.email });
    }
    await user.save({ validateBeforeSave: false });
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Reset attempts on success
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });
  }

  if (user.role === 'admin') {
    return res.status(403).json({ success: false, message: 'Please use the admin login page.' });
  }

  sendTokenResponse(res, 200, user, 'Login successful!');
});

// ── POST /api/auth/admin/login ─────────────────────────────────────
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const adminUser = await User.findOne({ email: email.toLowerCase() })
    .select('+password +loginAttempts +lockUntil');

  if (!adminUser) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (adminUser.isLocked) {
    const remaining = Math.ceil((adminUser.lockUntil - Date.now()) / 60000);
    return res.status(429).json({
      success: false,
      message: `Account locked. Try again in ${remaining} minute(s).`,
    });
  }

  const isMatch = await adminUser.comparePassword(password);
  if (!isMatch) {
    adminUser.loginAttempts = (adminUser.loginAttempts || 0) + 1;
    if (adminUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      adminUser.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      logger.warn('Admin account locked after failed attempts', { email: adminUser.email });
    }
    await adminUser.save({ validateBeforeSave: false });
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Reset on success
  adminUser.loginAttempts = 0;
  adminUser.lockUntil = undefined;
  await adminUser.save({ validateBeforeSave: false });

  if (adminUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not an admin account' });
  }

  sendAdminTokenResponse(res, 200, adminUser, 'Admin login successful!');
});

// ── POST /api/auth/refresh ─────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  // Support both user cookie and admin cookie — whichever is present in this request
  const token = req.cookies?.pakka_refresh || req.cookies?.pakka_admin_refresh;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  // Check if this refresh token has been revoked (logout invalidation)
  const isRevoked = await RevokedToken.findOne({ token });
  if (isRevoked) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }

  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'User not found or disabled' });
  }

  const newAccessToken = generateAccessToken(user._id);
  // Issue a new CSRF token on refresh too
  const csrfToken = issueCsrfToken(res);

  res.json({ success: true, token: newAccessToken, csrfToken });
});

// ── POST /api/auth/logout ──────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.pakka_refresh;

  if (token) {
    // Blacklist the refresh token so it can never be used again
    const decoded = verifyRefreshToken(token);
    if (decoded) {
      await RevokedToken.create({
        token,
        userId:    decoded.id,
        expiresAt: new Date(decoded.exp * 1000),
      }).catch(() => {}); // ignore duplicate-key errors (already revoked)
    }
  }

  // Clear both user and admin cookies to fully sign out
  res.clearCookie('pakka_refresh',       { ...REFRESH_COOKIE_OPTIONS,       maxAge: 0 });
  res.clearCookie('pakka_admin_refresh', { ...ADMIN_REFRESH_COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie('pakka_csrf');
  res.json({ success: true, message: 'Logged out successfully' });
});

// ── GET /api/auth/me ───────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// ── PUT /api/auth/profile ──────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true, runValidators: true }
  );
  res.json({ success: true, message: 'Profile updated!', user });
});


// ── POST /api/auth/forgot-password ────────────────────────────────
// Rate-limited to 3 requests/hour at route level
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return the same response — never reveal if email exists
  const genericResponse = { success: true, message: 'If that email exists, a reset link has been sent.' };

  if (!user || !user.isActive) return res.json(genericResponse);

  const PasswordResetToken = require('../models/PasswordResetToken');
  const rawToken = await PasswordResetToken.createToken(user._id);

  const { sendPasswordResetEmail } = require('../config/email');
  sendPasswordResetEmail(user.email, user.name, rawToken)
    .catch(err => logger.error('Password reset email failed', { error: err.message }));

  res.json(genericResponse);
});

// ── POST /api/auth/reset-password ─────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  const PasswordResetToken = require('../models/PasswordResetToken');
  const { valid, reason, record } = await PasswordResetToken.verifyToken(token);

  if (!valid) {
    return res.status(400).json({ success: false, message: reason });
  }

  const user = await User.findById(record.userId);
  if (!user || !user.isActive) {
    return res.status(400).json({ success: false, message: 'User not found or disabled' });
  }

  // Set new password — pre-save hook hashes it
  user.password      = password;
  user.loginAttempts = 0;        // clear any lockout
  user.lockUntil     = undefined;
  await user.save();

  // Mark token as used (one-time use)
  record.used = true;
  await record.save();

  // Invalidate all existing refresh tokens for this user
  const RevokedToken = require('../models/RevokedToken');
  // We can't revoke all at once without storing them — but we reset loginAttempts
  // The short access token (15 min) will naturally expire

  logger.info('Password reset completed', { userId: user._id });

  res.json({ success: true, message: 'Password reset successfully! Please login with your new password.' });
});

module.exports = {
  getCsrfToken, register, login, adminLogin,
  refreshToken, logout, getMe, updateProfile,
  forgotPassword, resetPassword,
};
