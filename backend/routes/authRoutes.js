const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const {
  getCsrfToken, register, login, adminLogin,
  refreshToken, logout, getMe, updateProfile,
  forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect }                          = require('../middleware/auth');
const { stripPrivilegedFields }            = require('../middleware/rbac');
const {
  validateRegister, validateLogin,
  validatePasswordReset,
}                                          = require('../middleware/validators');

// Strict rate limit for password reset
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many reset attempts. Try again in 1 hour.' },
});

router.get('/csrf-token',       getCsrfToken);
router.post('/register',        validateRegister,                    register);
router.post('/login',           validateLogin,                       login);
router.post('/admin/login',     validateLogin,                       adminLogin);
router.post('/refresh',         refreshToken);
router.post('/logout',          logout);
router.get('/me',               protect,                             getMe);

// stripPrivilegedFields ensures role/isActive cannot be injected via profile update
router.put('/profile',          protect, stripPrivilegedFields,      updateProfile);

// Password reset
router.post('/forgot-password', resetLimiter,                        forgotPassword);
router.post('/reset-password',  resetLimiter, validatePasswordReset, resetPassword);

module.exports = router;
