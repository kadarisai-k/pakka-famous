const express  = require('express');
const router   = express.Router();
const { validateCoupon } = require('../controllers/couponController');
const { protect }        = require('../middleware/auth');

// Allow both logged-in and guest users to validate coupons at checkout
router.post('/validate', validateCoupon);

module.exports = router;
