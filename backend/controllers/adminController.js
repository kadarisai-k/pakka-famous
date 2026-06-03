const User     = require('../models/User');
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const Coupon   = require('../models/Coupon');
const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');
const logger   = require('../utils/logger');

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', role = '' } = req.query;
  const query = {};
  if (search) query.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (role) query.role = role;
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit)),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
});

const getUserWithOrders = asyncHandler(async (req, res) => {
  const user   = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, user, orders });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot disable admin' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'enabled' : 'disabled'}`, user: { _id: user._id, isActive: user.isActive } });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await User.findById(req.user._id).select('+password');
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  admin.password = newPassword;
  await admin.save();
  res.json({ success: true, message: 'Password changed successfully!' });
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, message: 'Coupon deleted' });
});

// ── GET /api/admin/settings ───────────────────────────────────────
const getSettings = asyncHandler(async (req, res) => {
  const [freeDeliveryThreshold, deliveryCharge, cutoffTime, dailySummaryEnabled] =
    await Promise.all([
      Settings.getValue('freeDeliveryThreshold', 500),
      Settings.getValue('deliveryCharge', 50),
      Settings.getValue('cutoffTime', '23:00'),
      Settings.getValue('dailySummaryEnabled', true),
    ]);
  res.json({
    success: true,
    settings: { freeDeliveryThreshold, deliveryCharge, cutoffTime, dailySummaryEnabled },
  });
});

// ── PUT /api/admin/settings ───────────────────────────────────────
const updateSettings = asyncHandler(async (req, res) => {
  const { freeDeliveryThreshold, deliveryCharge, cutoffTime, dailySummaryEnabled } = req.body;
  const updates = [];

  if (freeDeliveryThreshold !== undefined) {
    const val = Number(freeDeliveryThreshold);
    if (isNaN(val) || val < 0)
      return res.status(400).json({ success: false, message: 'Free delivery threshold must be positive' });
    updates.push(Settings.setValue('freeDeliveryThreshold', val));
  }

  if (deliveryCharge !== undefined) {
    const val = Number(deliveryCharge);
    if (isNaN(val) || val < 0)
      return res.status(400).json({ success: false, message: 'Delivery charge must be positive' });
    updates.push(Settings.setValue('deliveryCharge', val));
  }

  if (cutoffTime !== undefined) {
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(cutoffTime))
      return res.status(400).json({ success: false, message: 'Cutoff time must be HH:MM (e.g. 23:00)' });
    updates.push(Settings.setValue('cutoffTime', cutoffTime));
    // cutoffTime is ALSO the dailySummaryTime — they are unified
    updates.push(Settings.setValue('dailySummaryTime', cutoffTime));
  }

  if (dailySummaryEnabled !== undefined) {
    updates.push(Settings.setValue('dailySummaryEnabled', Boolean(dailySummaryEnabled)));
  }

  await Promise.all(updates);

  // Reschedule cron job live if time-related settings changed
  if (cutoffTime !== undefined || dailySummaryEnabled !== undefined) {
    try {
      const { rescheduleJob } = require('../utils/scheduler');
      await rescheduleJob();
    } catch (e) {
      logger.error('[Settings] Reschedule failed:', e.message);
    }
  }

  const updated = {
    freeDeliveryThreshold: await Settings.getValue('freeDeliveryThreshold', 500),
    deliveryCharge:        await Settings.getValue('deliveryCharge', 50),
    cutoffTime:            await Settings.getValue('cutoffTime', '23:00'),
    dailySummaryEnabled:   await Settings.getValue('dailySummaryEnabled', true),
  };

  res.json({ success: true, message: 'Settings updated!', settings: updated });
});

module.exports = {
  getAllUsers, getUserWithOrders, toggleUserStatus,
  changePassword, getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getSettings, updateSettings,
};
