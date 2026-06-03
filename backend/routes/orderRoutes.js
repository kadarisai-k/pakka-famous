const express  = require('express');
const router   = express.Router();
const {
  placeOrder, cancelOrder, getCancellationStatus,
  getMyOrders, getOrder,
  getAllOrders, updateOrderStatus,
  getDashboardStats, getAnalytics, exportOrders,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { validateOrder }      = require('../middleware/validators');
const Settings               = require('../models/Settings');
const asyncHandler           = require('../middleware/asyncHandler');

// ── Public: delivery settings ─────────────────────────────────────
router.get('/delivery-settings', asyncHandler(async (req, res) => {
  const [freeDeliveryThreshold, deliveryCharge, cutoffTime] = await Promise.all([
    Settings.getValue('freeDeliveryThreshold', 500),
    Settings.getValue('deliveryCharge', 50),
    Settings.getValue('cutoffTime', '23:00'),
  ]);
  res.json({ success: true, freeDeliveryThreshold, deliveryCharge, cutoffTime });
}));

// ── Cancellation window status (logged-in users) ──────────────────
router.get('/cancellation-status', protect, getCancellationStatus);

// ── User routes ───────────────────────────────────────────────────
router.post('/',              protect, validateOrder, placeOrder);
router.get('/my-orders',      protect, getMyOrders);
router.post('/:id/cancel',    protect, validateObjectId(), cancelOrder);

// ── Admin routes ──────────────────────────────────────────────────
router.get('/admin/all',      protect, adminOnly, getAllOrders);
router.get('/admin/analytics',protect, adminOnly, getAnalytics);
router.get('/admin/stats',    protect, adminOnly, getDashboardStats);
router.get('/admin/export',   protect, adminOnly, exportOrders);

// ── Single order ──────────────────────────────────────────────────
router.get('/:id',            protect, validateObjectId(), getOrder);
router.put('/:id/status',     protect, adminOnly, validateObjectId(), updateOrderStatus);

module.exports = router;
