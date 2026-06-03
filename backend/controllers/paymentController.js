/**
 * paymentController.js — Razorpay Integration
 *
 * Flow:
 *  1. Frontend calls POST /api/payments/create-order
 *     → Backend creates a Razorpay order, returns { razorpayOrderId, amount, keyId }
 *  2. Frontend opens Razorpay popup with those details
 *     → Customer pays via UPI / card / net banking
 *  3. On success, Razorpay gives { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *  4. Frontend calls POST /api/payments/verify-and-place
 *     → Backend verifies signature → places order → sends WhatsApp + email
 */

const Order        = require('../models/Order');
const Cart         = require('../models/Cart');
const Product      = require('../models/Product');
const Coupon       = require('../models/Coupon');
const Settings     = require('../models/Settings');
const asyncHandler = require('../middleware/asyncHandler');
const { createRazorpayOrder, verifyPaymentSignature } = require('../utils/razorpay');
const { sendOrderConfirmationEmail, sendAdminOrderNotification } = require('../config/email');
const { sendUserOrderConfirmation, sendAdminOrderAlert, sendShopOrderAlerts } = require('../utils/whatsapp');

// ── Helper: calculate cart totals ─────────────────────────────────
async function calcCartTotals(userId, couponCode) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      throw new Error(`"${item.product?.name || 'A product'}" is no longer available`);
    }
  }

  const subtotal = cart.totalAmount;

  const [freeDeliveryThreshold, deliveryChargeAmt] = await Promise.all([
    Settings.getValue('freeDeliveryThreshold', 500),
    Settings.getValue('deliveryCharge', 50),
  ]);
  const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeAmt;

  let couponDiscount = 0, appliedCouponCode = '', couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (couponDoc && couponDoc.isValid && subtotal >= couponDoc.minOrderAmount) {
      couponDiscount    = +(subtotal * couponDoc.discountPercentage / 100).toFixed(2);
      appliedCouponCode = couponDoc.code;
    }
  }

  const totalAmount = +(subtotal + deliveryCharge - couponDiscount).toFixed(2);
  return { cart, subtotal, deliveryCharge, couponDiscount, appliedCouponCode, couponDoc, totalAmount };
}

// ── POST /api/payments/create-order ──────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  const { totalAmount } = await calcCartTotals(req.user._id, couponCode);

  const razorpayOrder = await createRazorpayOrder({
    amount:  totalAmount,
    orderId: req.user._id.toString(),
    notes:   { userId: req.user._id.toString(), couponCode: couponCode || '' },
  });

  res.json({
    success:         true,
    razorpayOrderId: razorpayOrder.id,
    amount:          totalAmount,
    amountPaise:     razorpayOrder.amount,
    currency:        razorpayOrder.currency,
    keyId:           process.env.RAZORPAY_KEY_ID,
  });
});

// ── POST /api/payments/verify-and-place ──────────────────────────
const verifyAndPlace = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingAddress,
    couponCode,
  } = req.body;

  // 1. Verify signature
  const isValid = verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Please contact support.' });
  }

  // 2. Idempotency — never place the same order twice
  const existing = await Order.findOne({ transactionId: razorpay_payment_id });
  if (existing) {
    return res.json({ success: true, order: existing, message: 'Order already placed' });
  }

  // 3. Recalculate totals server-side
  const { cart, subtotal, deliveryCharge, couponDiscount, appliedCouponCode, couponDoc, totalAmount }
    = await calcCartTotals(req.user._id, couponCode);

  // 4. Build order items
  const orderItems = cart.items.map(item => ({
    product:    item.product._id,
    name:       item.product.name,
    image:      item.product.image?.url || '',
    quantity:   item.quantity,
    price:      item.price,
    totalPrice: +(item.price * item.quantity).toFixed(2),
  }));

  // 5. Save order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod:   'Online',
    paymentStatus:   'Paid',
    transactionId:   razorpay_payment_id,
    razorpayOrderId: razorpay_order_id,
    subtotal,
    deliveryCharge,
    couponCode:      appliedCouponCode,
    couponDiscount,
    totalAmount,
    cutoffStatus: initialCutoffStatus,
    statusHistory: [{ status: 'Ordered', note: 'Order placed — online payment confirmed via Razorpay' }],
  });

  // 7. Mark coupon used
  if (couponDoc) { couponDoc.usedCount += 1; await couponDoc.save(); }

  // 8. Increment product sales counts
  await Product.bulkWrite(
    cart.items.map(item => ({
      updateOne: { filter: { _id: item.product._id }, update: { $inc: { salesCount: item.quantity } } },
    }))
  );

  // 9. Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });

  // 10. Populate order for notifications (include product shopWhatsapp + shopName)
  const populatedOrder = await Order.findById(order._id)
    .populate('items.product', 'name image shopWhatsapp shopName');

  // 11. Email notifications (fire and forget)
  sendOrderConfirmationEmail(req.user.email, req.user.name, populatedOrder)
    .catch(e => console.error('Email error:', e.message));
  sendAdminOrderNotification(populatedOrder, req.user.name)
    .catch(e => console.error('Admin email error:', e.message));

  // 12. WhatsApp — customer confirmation
  const phone = shippingAddress?.phone || req.user.phone || '';
  sendUserOrderConfirmation(phone, populatedOrder)
    .catch(e => console.error('WhatsApp user error:', e.message));

  // 13. WhatsApp — admin alert
  sendAdminOrderAlert(populatedOrder, req.user.name, phone)
    .catch(e => console.error('WhatsApp admin error:', e.message));

  // 14. WhatsApp — each sweet shop gets only their items
  sendShopOrderAlerts(populatedOrder)
    .catch(e => console.error('WhatsApp shop error:', e.message));

  res.status(201).json({ success: true, order, message: 'Payment successful! Order placed 🎉' });
});

// ── POST /api/payments/failed ─────────────────────────────────────
const paymentFailed = asyncHandler(async (req, res) => {
  console.warn('Razorpay payment failed/cancelled:', { user: req.user._id, ...req.body });
  res.json({ success: true });
});

module.exports = { createOrder, verifyAndPlace, paymentFailed };
