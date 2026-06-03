const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [1, 'Discount must be at least 1%'],
    max: [90, 'Discount cannot exceed 90%']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  minOrderAmount: {
    type: Number,
    default: 0   // minimum cart value to apply coupon
  },
  usageLimit: {
    type: Number,
    default: null  // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual: is coupon currently valid?
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  const notExpired = this.expiryDate > now;
  const withinLimit = this.usageLimit === null || this.usedCount < this.usageLimit;
  return this.active && notExpired && withinLimit;
});

couponSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Coupon', couponSchema);
