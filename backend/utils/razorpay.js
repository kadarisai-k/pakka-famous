/**
 * Razorpay Payment Gateway Utility
 * Docs: https://razorpay.com/docs/payments/server-integration/nodejs/
 */
const Razorpay = require('razorpay');
const crypto   = require('crypto');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create a Razorpay order (called before showing payment popup) ──
// Returns { id, amount, currency } — frontend uses this to open popup
async function createRazorpayOrder({ amount, orderId, notes = {} }) {
  const options = {
    amount:   Math.round(amount * 100), // Razorpay expects paise
    currency: 'INR',
    receipt:  `receipt_${orderId}`,
    notes,
  };
  const order = await razorpay.orders.create(options);
  return order; // { id, amount, currency, receipt, status }
}

// ── Verify payment signature after popup success ───────────────────
// Razorpay sends: razorpay_order_id, razorpay_payment_id, razorpay_signature
// We verify the signature to confirm the payment is genuine
function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected  = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === razorpay_signature;
}

// ── Fetch payment details from Razorpay (optional, for extra safety) ─
async function fetchPayment(paymentId) {
  return razorpay.payments.fetch(paymentId);
}

module.exports = { createRazorpayOrder, verifyPaymentSignature, fetchPayment };
