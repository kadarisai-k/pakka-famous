const express    = require('express');
const router     = express.Router();
const CitySweet  = require('../models/CitySweet');
const asyncHandler = require('../middleware/asyncHandler');

// Public — active city sweets for homepage
router.get('/', asyncHandler(async (req, res) => {
  const items = await CitySweet.find({ isActive: true }).sort({ order: 1, cityName: 1 });
  res.json({ success: true, citySweets: items });
}));

module.exports = router;
