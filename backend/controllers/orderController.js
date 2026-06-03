const Order    = require('../models/Order');
const Cart     = require('../models/Cart');
const Product  = require('../models/Product');
const Coupon   = require('../models/Coupon');
const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../config/email');
const { sendUserOrderConfirmation, sendAdminOrderAlert, sendShopOrderAlerts, sendWhatsAppRaw } = require('../utils/whatsapp');
const logger = require('../utils/logger');

// ── Helper: get the cutoff UTC timestamp for a SPECIFIC calendar day ──
// orderDate = the Date the order was placed (used to find that day's cutoff)
async function getCutoffUTCForDate(orderDate) {
  const cutoffTime = await Settings.getValue('cutoffTime', '23:00');
  const [h, m] = cutoffTime.split(':').map(Number);

  const IST_MS = 5.5 * 60 * 60 * 1000;

  // Convert orderDate to IST to find which calendar day it belongs to
  const orderIST = new Date(orderDate.getTime() + IST_MS);

  // Build cutoff on THAT same IST day
  const cutoffIST = new Date(orderIST);
  cutoffIST.setHours(h, m, 0, 0);

  // Convert back to UTC
  return new Date(cutoffIST.getTime() - IST_MS);
}

// ── Helper: get today's cutoff in UTC ────────────────────────────
async function getTodayCutoffUTC() {
  return getCutoffUTCForDate(new Date());
}

// ── Helper: is the global cancellation window open right now? ────
// (for new orders placed today only)
async function isCancellationAllowed() {
  const cutoffUTC = await getTodayCutoffUTC();
  return new Date() < cutoffUTC;
}

// ── Helper: can THIS specific order still be cancelled? ──────────
// Rules:
//  1. Order must have been placed TODAY (IST date must match today IST date)
//  2. Current time must be before that day's cutoff
async function isOrderCancellable(order) {
  const IST_MS = 5.5 * 60 * 60 * 1000;
  const now    = new Date();

  // Get today's date in IST (YYYY-MM-DD)
  const todayIST   = new Date(now.getTime() + IST_MS);
  const todayStr   = todayIST.toISOString().slice(0, 10);

  // Get the order's placement date in IST
  const orderIST   = new Date(order.createdAt.getTime() + IST_MS);
  const orderStr   = orderIST.toISOString().slice(0, 10);

  // Order must be from TODAY in IST
  if (orderStr !== todayStr) return false;

  // Current time must be before today's cutoff
  const cutoffUTC = await getCutoffUTCForDate(order.createdAt);
  return now < cutoffUTC;
}

// ── POST /orders ──────────────────────────────────────────────────
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'COD', couponCode } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      return res.status(400).json({
        success: false,
        message: `"${item.product?.name || 'A product'}" is no longer available`,
      });
    }
  }

  const orderItems = cart.items.map(item => ({
    product:    item.product._id,
    name:       item.product.name,
    image:      item.product.image?.url || '',
    quantity:   item.quantity,
    price:      item.price,
    totalPrice: +(item.price * item.quantity).toFixed(2),
  }));

  const subtotal = cart.totalAmount;

  const [freeDeliveryThreshold, deliveryChargeAmt] = await Promise.all([
    Settings.getValue('freeDeliveryThreshold', 500),
    Settings.getValue('deliveryCharge', 50),
  ]);
  const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeAmt;

  let couponDiscount = 0, appliedCouponCode = '';
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon)         return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    if (!coupon.isValid) return res.status(400).json({ success: false, message: 'Coupon is expired or inactive' });
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderAmount} required` });
    }
    couponDiscount    = +(subtotal * coupon.discountPercentage / 100).toFixed(2);
    appliedCouponCode = coupon.code;
    coupon.usedCount += 1;
    await coupon.save();
  }

  const totalAmount = +(subtotal + deliveryCharge - couponDiscount).toFixed(2);

  // Determine initial cutoffStatus — if placed after today's cutoff it's immediately CONFIRMED
  const allowed = await isCancellationAllowed();
  const initialCutoffStatus = allowed ? 'PENDING' : 'CONFIRMED';

  const order = await Order.create({
    user: req.user._id, items: orderItems, shippingAddress, paymentMethod,
    subtotal, deliveryCharge, couponCode: appliedCouponCode, couponDiscount, totalAmount,
    cutoffStatus: initialCutoffStatus,
    statusHistory: [{ status: 'Ordered', note: 'Order placed successfully' }],
  });

  await Product.bulkWrite(
    cart.items.map(item => ({
      updateOne: { filter: { _id: item.product._id }, update: { $inc: { salesCount: item.quantity } } },
    }))
  );

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });

  const populatedOrder = await Order.findById(order._id)
    .populate('items.product', 'name image shopWhatsapp shopName');

  sendOrderConfirmationEmail(req.user.email, req.user.name, populatedOrder)
    .catch(err => logger.error('User email error:', err.message));
  sendAdminOrderNotification(populatedOrder, req.user.name)
    .catch(err => logger.error('Admin email error:', err.message));

  const userPhone = shippingAddress?.phone || req.user.phone || '';
  sendUserOrderConfirmation(userPhone, populatedOrder)
    .catch(err => logger.error('User WhatsApp error:', err.message));
  sendAdminOrderAlert(populatedOrder, req.user.name, userPhone)
    .catch(err => logger.error('Admin WhatsApp error:', err.message));
  sendShopOrderAlerts(populatedOrder)
    .catch(err => logger.error('Shop WhatsApp error:', err.message));

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order,
    cutoffStatus: initialCutoffStatus,
  });
});

// ── POST /orders/:id/cancel ───────────────────────────────────────
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Only the owner can cancel
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
  }

  // Already cancelled
  if (order.orderStatus === 'Cancelled' || order.cutoffStatus === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Order is already cancelled' });
  }

  // Already confirmed (cutoff passed OR order is from a previous day)
  if (order.cutoffStatus === 'CONFIRMED') {
    const cutoffTime = await Settings.getValue('cutoffTime', '23:00');
    return res.status(400).json({
      success: false,
      message: `This order cannot be cancelled. The cutoff time (${cutoffTime} IST) has passed and the order is now confirmed.`,
      code: 'CUTOFF_PASSED',
    });
  }

  // Order placed on a PREVIOUS day — even if still PENDING in DB, it cannot be cancelled
  // (This handles legacy orders or edge cases where the cron job hasn't run yet)
  const IST_MS   = 5.5 * 60 * 60 * 1000;
  const todayStr = new Date(Date.now() + IST_MS).toISOString().slice(0, 10);
  const orderStr = new Date(order.createdAt.getTime() + IST_MS).toISOString().slice(0, 10);
  if (orderStr !== todayStr) {
    return res.status(400).json({
      success: false,
      message: 'This order was placed on a previous day and can no longer be cancelled.',
      code: 'CUTOFF_PASSED',
    });
  }

  // Cannot cancel orders already being prepared / shipped / delivered
  if (['Preparing', 'Shipped', 'Delivered'].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel an order that is already ${order.orderStatus.toLowerCase()}`,
    });
  }

  // Check current time vs this order's cutoff
  const cutoffUTC  = await getCutoffUTCForDate(order.createdAt);
  const nowAllowed = new Date() < cutoffUTC;
  if (!nowAllowed) {
    const cutoffTime = await Settings.getValue('cutoffTime', '23:00');
    return res.status(400).json({
      success: false,
      message: `Cancellation window closed. The cutoff time (${cutoffTime} IST) has passed. Your order is now confirmed.`,
      code: 'CUTOFF_PASSED',
    });
  }

  // All checks passed — cancel the order
  const { reason = '' } = req.body;
  order.orderStatus      = 'Cancelled';
  order.cutoffStatus     = 'CANCELLED';
  order.cancelledAt      = new Date();
  order.cancellationReason = reason;
  order.statusHistory.push({
    status: 'Cancelled',
    note: reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
  });
  await order.save();

  // Notify customer via WhatsApp
  const userPhone = order.shippingAddress?.phone || req.user.phone || '';
  if (userPhone) {
    const body =
`❌ *Order Cancelled – Pakka Famous*

Hi ${order.shippingAddress?.name || 'Customer'}, your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled successfully.

💰 *Refund:* ${order.paymentMethod === 'Online'
  ? 'Your payment will be refunded within 5-7 business days.'
  : 'No payment was charged (COD order).'}

If you have questions, please contact us.
Thank you for choosing *Pakka Famous* 🍬`;
    sendWhatsAppRaw(userPhone, body).catch(e => logger.error('Cancel WhatsApp error:', e.message));
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    order,
  });
});

// ── GET /orders/cancellation-status ──────────────────────────────
// Returns the global cancellation window status + today's IST date.
// Frontend must ALSO check that the order was placed today before showing cancel button.
const getCancellationStatus = asyncHandler(async (req, res) => {
  const cutoffTime = await Settings.getValue('cutoffTime', '23:00');
  const allowed    = await isCancellationAllowed();
  const cutoffUTC  = await getTodayCutoffUTC();

  const IST_MS  = 5.5 * 60 * 60 * 1000;
  const todayIST = new Date(Date.now() + IST_MS).toISOString().slice(0, 10); // "2026-04-03"

  res.json({
    success: true,
    cancellationAllowed: allowed,    // window is currently open
    cutoffTime,                      // "23:00" — for display
    cutoffTimestamp: cutoffUTC.toISOString(), // exact UTC — for countdown timer
    todayIST,                        // today's date in IST — frontend compares with order's createdAt
  });
});

// ── GET /orders/my-orders ─────────────────────────────────────────
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 }).populate('items.product', 'name image');
  res.json({ success: true, orders });
});

// ── GET /orders/:id ───────────────────────────────────────────────
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
});

// ── PUT /orders/:id/status (admin) ───────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const valid = ['Ordered', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: status, $push: { statusHistory: { status, note: note || '' } } },
    { new: true }
  ).populate('user', 'name email').populate('items.product');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, message: 'Order status updated!', order });
});

// ── GET /orders/admin/all ─────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, cutoffStatus, page = 1, limit = 20, dateFilter, startDate, endDate } = req.query;
  const query = buildDateQuery(dateFilter, startDate, endDate);
  if (status)       query.orderStatus  = status;
  if (cutoffStatus) query.cutoffStatus = cutoffStatus;
  const safePage  = Math.max(1, parseInt(page));
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit)));
  const [total, orders] = await Promise.all([
    Order.countDocuments(query),
    Order.find(query).sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit).limit(safeLimit)
      .populate('user', 'name email phone').populate('items.product', 'name image'),
  ]);
  res.json({ success: true, orders, total, pages: Math.ceil(total / safeLimit) });
});

// ── GET /orders/admin/stats ───────────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const [totalUsers, totalOrders, totalProducts, revenueResult, ordersByStatus, recentOrders] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([{ $match: { orderStatus: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ]);
  res.json({
    success: true,
    stats: { totalUsers, totalOrders, totalRevenue: revenueResult[0]?.total || 0, totalProducts },
    ordersByStatus, recentOrders,
  });
});

// ── GET /orders/admin/analytics ───────────────────────────────────
const getAnalytics = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const OccasionOrder = require('../models/OccasionOrder');
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);

  const [totalUsers, totalOrders, revenueResult, totalProducts,
         occasionOrdersCount, ordersLast30, revenueLast7,
         orderTimeSeries, topProducts, recentOccasionOrders] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Order.aggregate([{ $match: { orderStatus: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Product.countDocuments({ isActive: true }),
    OccasionOrder.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.aggregate([{ $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.totalPrice' } } },
      { $sort: { totalSold: -1 } }, { $limit: 5 },
    ]),
    OccasionOrder.find().sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    success: true,
    stats: { totalUsers, totalOrders, totalRevenue: revenueResult[0]?.total || 0, totalProducts, occasionOrdersCount, ordersLast30, revenueLast7: revenueLast7[0]?.total || 0 },
    orderTimeSeries, topProducts, recentOccasionOrders,
  });
});

// ── GET /orders/admin/export ──────────────────────────────────────
const exportOrders = asyncHandler(async (req, res) => {
  const XLSX = require('xlsx');
  const { dateFilter, startDate, endDate, format = 'xlsx' } = req.query;
  const orders = await Order.find(buildDateQuery(dateFilter, startDate, endDate))
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone')
    .populate('items.product', 'name');

  const rows = [];
  orders.forEach(o => o.items.forEach(item => rows.push({
    'Order ID':  o._id.toString().slice(-8).toUpperCase(),
    'Date':      new Date(o.createdAt).toLocaleString('en-IN'),
    'Customer':  o.user?.name || '', 'Email': o.user?.email || '', 'Phone': o.user?.phone || '',
    'Address':   `${o.shippingAddress.street}, ${o.shippingAddress.city}, ${o.shippingAddress.state} - ${o.shippingAddress.pincode}`,
    'Product':   item.name, 'Qty': item.quantity, 'Unit Price': item.price, 'Item Total': item.totalPrice,
    'Subtotal':  o.subtotal, 'Delivery': o.deliveryCharge, 'Coupon': o.couponCode || '',
    'Discount':  o.couponDiscount || 0, 'Grand Total': o.totalAmount,
    'Payment':   o.paymentMethod, 'Order Status': o.orderStatus, 'Cutoff Status': o.cutoffStatus,
  })));

  if (format === 'csv') {
    if (!rows.length) return res.status(404).json({ success: false, message: 'No orders found' });
    const h = Object.keys(rows[0]);
    const csv = [h.join(','), ...rows.map(r => h.map(k => `"${String(r[k]).replace(/"/g,'""')}"`).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);
    return res.send(csv);
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Message: 'No orders' }]);
  ws['!cols'] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.max(k.length, 15) }));
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.xlsx"`);
  res.send(buf);
});

// ── Utility ───────────────────────────────────────────────────────
function buildDateQuery(dateFilter, startDate, endDate) {
  if (!dateFilter) return {};
  const now = new Date();
  let from, to = new Date(now); to.setHours(23, 59, 59, 999);
  switch (dateFilter) {
    case 'today':     from = new Date(now); from.setHours(0,0,0,0); break;
    case 'yesterday': from = new Date(now); from.setDate(from.getDate()-1); from.setHours(0,0,0,0);
                      to   = new Date(now); to.setDate(to.getDate()-1); to.setHours(23,59,59,999); break;
    case 'last7':     from = new Date(now); from.setDate(from.getDate()-6); from.setHours(0,0,0,0); break;
    case 'last30':    from = new Date(now); from.setDate(from.getDate()-29); from.setHours(0,0,0,0); break;
    case 'custom':
      if (startDate) { from = new Date(startDate); from.setHours(0,0,0,0); }
      if (endDate)   { to   = new Date(endDate);   to.setHours(23,59,59,999); }
      break;
  }
  return from ? { createdAt: { $gte: from, $lte: to } } : {};
}

module.exports = {
  placeOrder, cancelOrder, getCancellationStatus,
  getMyOrders, getOrder,
  getAllOrders, updateOrderStatus,
  getDashboardStats, getAnalytics, exportOrders,
};
