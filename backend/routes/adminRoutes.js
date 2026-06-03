const express  = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const router   = express.Router();
const {
  getAllUsers, getUserWithOrders, toggleUserStatus,
  changePassword, getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getSettings, updateSettings,
} = require('../controllers/adminController');
const {
  getAllCitySweets, createCitySweet, updateCitySweet, deleteCitySweet,
} = require('../controllers/contentController');
const { protect, adminOnly }                    = require('../middleware/auth');
const { validateObjectId, stripPrivilegedFields } = require('../middleware/rbac');
const { validateChangePassword }                = require('../middleware/validators');
const { upload }                                = require('../config/cloudinary');

// ── All admin routes require: authenticated + admin role ──────────
router.use(protect, adminOnly);

// Users
router.get('/users',                                        getAllUsers);
router.get('/users/:id',    validateObjectId(),             getUserWithOrders);
router.put('/users/:id/toggle', validateObjectId(),         toggleUserStatus);

// Admin password change
router.put('/change-password', validateChangePassword,      changePassword);

// Coupons
router.get('/coupons',                                      getCoupons);
router.post('/coupons',                                     createCoupon);
router.put('/coupons/:id',  validateObjectId(),             updateCoupon);
router.delete('/coupons/:id', validateObjectId(),           deleteCoupon);

// City Sweets
router.get('/city-sweets',                                  getAllCitySweets);
router.post('/city-sweets',    upload.single('image'),      createCitySweet);
router.put('/city-sweets/:id', validateObjectId(),
           upload.single('image'),                          updateCitySweet);
router.delete('/city-sweets/:id', validateObjectId(),       deleteCitySweet);

// Settings (delivery threshold, etc.)
router.get('/settings',                                     getSettings);
router.put('/settings',                                     updateSettings);

module.exports = router;

// Manual trigger — confirm pending + send summary right now (for testing)
router.post('/trigger-summary', asyncHandler(async (req, res) => {
  const { sendDailyShopSummaries } = require('../utils/dailySummary');
  await sendDailyShopSummaries();
  res.json({ success: true, message: 'Cutoff triggered: pending orders confirmed + summaries sent!' });
}));
