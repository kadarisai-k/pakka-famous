/**
 * Role-Based Access Control (RBAC) middleware
 * 
 * Roles in this system:
 *   admin — full access to admin panel, all data, user management
 *   user  — can shop, place orders, manage own cart/wishlist/profile
 * 
 * Usage:
 *   router.get('/admin/users', protect, requireRole('admin'), handler)
 *   router.post('/orders',     protect, requireRole('user'),  handler)
 *   router.get('/orders/:id',  protect, requireOwnerOrAdmin('user'), handler)
 */

const mongoose = require('mongoose');

// ── Require a specific role ────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}`,
    });
  }
  next();
};

// Shorthand aliases
const adminOnly = requireRole('admin');
const userOnly  = requireRole('user');

// ── Validate MongoDB ObjectId params before DB hit ─────────────────
// Prevents CastError crashes from malformed IDs like /orders/../../etc
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
  next();
};

// ── Prevent role escalation in body ────────────────────────────────
// Strip any attempt to inject role/isActive/loginAttempts via req.body
const stripPrivilegedFields = (req, res, next) => {
  const forbidden = ['role', 'isActive', 'loginAttempts', 'lockUntil', 'password'];
  forbidden.forEach(field => {
    if (req.body[field] !== undefined) {
      delete req.body[field];
    }
  });
  next();
};

// ── Ownership check: user can only access their own resource ───────
// Assumes the resource has a `user` field with the owner's ObjectId
// Usage: router.get('/:id', protect, requireOwnerOrAdmin(Model))
const requireOwnerOrAdmin = (Model) => async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // Admins can access anything
    if (req.user.role === 'admin') return next();

    const resource = await Model.findById(req.params.id).select('user');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    if (resource.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. Not your resource.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireRole, adminOnly, userOnly, validateObjectId, stripPrivilegedFields, requireOwnerOrAdmin };
