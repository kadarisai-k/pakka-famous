const express = require('express');
const router  = express.Router();
const { createOrder, verifyAndPlace, paymentFailed } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// POST /api/payments/create-order — Step 1: get Razorpay order ID to open popup
router.post('/create-order', protect, createOrder);

// POST /api/payments/verify-and-place — Step 2: verify payment + place order
router.post('/verify-and-place', protect, verifyAndPlace);

// POST /api/payments/failed — user cancelled or payment failed
router.post('/failed', protect, paymentFailed);

module.exports = router;
