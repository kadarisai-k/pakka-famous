const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Token generators ───────────────────────────────────────────────
const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh'), {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh'));
  } catch {
    return null;
  }
};

// ── protect: verify JWT, attach req.user ──────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user)          return res.status(401).json({ success: false, message: 'User not found.' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is disabled.' });

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// ── adminOnly: shorthand guard (re-exported from rbac for convenience) ──
const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

module.exports = {
  protect, adminOnly,
  generateAccessToken, generateRefreshToken, verifyRefreshToken,
};
