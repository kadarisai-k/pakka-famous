const Coupon = require('../models/Coupon');
const asyncHandler = require('../middleware/asyncHandler');

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });
  if (cartTotal === undefined || cartTotal < 0) {
    return res.status(400).json({ success: false, message: 'Valid cart total is required' });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon)         return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  if (!coupon.isValid) return res.status(400).json({ success: false, message: 'Coupon has expired or is inactive' });
  if (cartTotal < coupon.minOrderAmount) {
    return res.status(400).json({ success: false, message: `Minimum order amount ₹${coupon.minOrderAmount} required` });
  }

  const discountAmount = +((cartTotal * coupon.discountPercentage) / 100).toFixed(2);
  res.json({
    success: true,
    message: `Coupon applied! ${coupon.discountPercentage}% off`,
    coupon: {
      code:               coupon.code,
      discountPercentage: coupon.discountPercentage,
      discountAmount,
      minOrderAmount:     coupon.minOrderAmount,
    },
  });
});

module.exports = { validateCoupon };
