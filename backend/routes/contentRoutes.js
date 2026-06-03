const express  = require('express');
const router   = express.Router();
const { getHomepageContent, updateHomepageContent, addShopImage, removeShopImage } = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload }             = require('../config/cloudinary');

router.get('/homepage', getHomepageContent);   // public
router.put('/homepage',
  protect, adminOnly,
  upload.fields([{ name: 'heroImage', maxCount: 1 }, { name: 'logo', maxCount: 1 }, { name: 'todayOfferBannerImage', maxCount: 1 }]),
  updateHomepageContent);
router.post('/homepage/shop-image',        protect, adminOnly, upload.single('image'), addShopImage);
router.delete('/homepage/shop-image/:publicId', protect, adminOnly, removeShopImage);

module.exports = router;
