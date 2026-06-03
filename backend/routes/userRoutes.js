const express      = require('express');
const router       = express.Router();
const User         = require('../models/User');
const { protect }  = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// All user routes require authentication
router.use(protect);

router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -loginAttempts -lockUntil');
  res.json({ success: true, user });
}));

module.exports = router;
