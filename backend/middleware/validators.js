const { body, validationResult } = require('express-validator');

// Run validators and return first error
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Password strength rules (shared) ──────────────────────────────
// Must have: 8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const passwordStrength = () =>
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      .withMessage('Password must contain at least one special character (!@#$%^&* etc.)');

// ── Register ───────────────────────────────────────────────────────
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
  passwordStrength(),
  validate,
];

// ── Login (no strength check — just presence) ──────────────────────
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate,
];

// ── Product ────────────────────────────────────────────────────────
const validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be 2–100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional(),
  validate,
];

// ── Order ──────────────────────────────────────────────────────────
const validateOrder = [
  body('shippingAddress.name').trim().notEmpty().withMessage('Recipient name is required'),
  body('shippingAddress.phone')
    .trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode')
    .trim().notEmpty().withMessage('Pincode is required')
    .matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  body('paymentMethod')
    .optional()
    .isIn(['COD', 'Online']).withMessage('Invalid payment method'),
  validate,
];

// ── Password reset ─────────────────────────────────────────────────
const validatePasswordReset = [
  passwordStrength(),
  body('token').notEmpty().withMessage('Reset token is required'),
  validate,
];

// ── Change password (admin settings) ──────────────────────────────
const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      .withMessage('Must contain at least one special character'),
  validate,
];

module.exports = {
  validateRegister, validateLogin, validateProduct,
  validateOrder, validatePasswordReset, validateChangePassword, validate,
};
