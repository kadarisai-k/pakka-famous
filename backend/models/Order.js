const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:       { type: String, required: true },
  image:      { type: String },
  quantity:   { type: Number, required: true, min: 1 },
  price:      { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  orderStatus: {
    type: String,
    enum: ['Ordered', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Ordered',
  },

  // ── Cutoff / Cancellation fields ──────────────────────────────
  // cutoffStatus tracks the business lifecycle independent of delivery status
  cutoffStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING',
    // PENDING   = placed today, can still be cancelled before cutoff
    // CONFIRMED = cutoff passed, order is locked (daily summary included)
    // CANCELLED = customer cancelled before cutoff
  },
  cancelledAt:   { type: Date, default: null },  // timestamp when customer cancelled
  cancellationReason: { type: String, default: '' },

  transactionId:   { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  subtotal:       { type: Number, required: true },
  deliveryCharge: { type: Number, default: 50 },
  couponCode:     { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  totalAmount:    { type: Number, required: true },
  statusHistory: [{
    status:    String,
    updatedAt: { type: Date, default: Date.now },
    note:      String,
  }],
}, { timestamps: true });

// ── Indexes ─────────────────────────────────────────────────────
orderSchema.index({ transactionId: 1 }, { sparse: true });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ cutoffStatus: 1, createdAt: -1 });   // for daily summary queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.pincode': 1 });

module.exports = mongoose.model('Order', orderSchema);
