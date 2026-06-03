const express = require('express');
const router  = express.Router();
const {
  getPackings, getPackingsByOccasion, getAllPackings,
  createPacking, updatePacking, deletePacking,
  createOccasionOrder, getOccasionOrders, updateOccasionOrder,
} = require('../controllers/packingController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { upload }             = require('../config/cloudinary');

router.get('/',                        getPackings);
router.get('/by-occasion/:occasionId', getPackingsByOccasion);   // ← key route
router.get('/admin/all',               protect, adminOnly, getAllPackings);
router.post('/',                       protect, adminOnly, upload.single('image'), createPacking);
router.put('/:id',                     protect, adminOnly, validateObjectId(), upload.single('image'), updatePacking);
router.delete('/:id',                  protect, adminOnly, validateObjectId(), deletePacking);

router.post('/occasion-orders',        createOccasionOrder);
router.get('/occasion-orders/all',     protect, adminOnly, getOccasionOrders);
router.put('/occasion-orders/:id',     protect, adminOnly, validateObjectId(), updateOccasionOrder);

module.exports = router;
