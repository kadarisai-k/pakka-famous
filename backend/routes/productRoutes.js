const express  = require('express');
const router   = express.Router();
const {
  getProducts, getProduct, getFeaturedProducts, getTopSellerProducts,
  getBestSellingProducts, getSeasonalProducts, getTodaySpecial, createProduct, updateProduct,
  updateProductFlags, deleteProduct, getCities,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { validateProduct }    = require('../middleware/validators');
const { upload }             = require('../config/cloudinary');

// Public
router.get('/',           getProducts);
router.get('/featured',   getFeaturedProducts);
router.get('/topsellers', getTopSellerProducts);
router.get('/todayspecial',  getTodaySpecial);
router.get('/bestselling',getBestSellingProducts);
router.get('/seasonal',   getSeasonalProducts);
router.get('/cities',     getCities);
router.get('/:id',        validateObjectId(), getProduct);

// Admin only
router.post('/',
  protect, adminOnly,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'hoverImage', maxCount: 1 }]),
  validateProduct, createProduct);

router.put('/:id',
  protect, adminOnly, validateObjectId(),
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'hoverImage', maxCount: 1 }]),
  validateProduct, updateProduct);

router.patch('/:id/flags', protect, adminOnly, validateObjectId(), updateProductFlags);
router.delete('/:id',      protect, adminOnly, validateObjectId(), deleteProduct);

module.exports = router;
