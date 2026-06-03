const express  = require('express');
const router   = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist, getWishlistIds } = require('../controllers/wishlistController');
const { protect }          = require('../middleware/auth');
const { validateObjectId } = require('../middleware/rbac');

// All wishlist routes require authentication
router.use(protect);

router.get('/',                                             getWishlist);
router.get('/ids',                                          getWishlistIds);
router.post('/add',                                         addToWishlist);
router.delete('/remove/:productId', validateObjectId('productId'), removeFromWishlist);

module.exports = router;
