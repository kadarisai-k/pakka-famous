const express = require('express');
const router  = express.Router();
const { getLiveOffers, getAllOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/specialOfferController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { upload }             = require('../config/cloudinary');

router.get('/',          getLiveOffers);                                              // public
router.get('/admin/all', protect, adminOnly, getAllOffers);                           // admin
router.post('/',         protect, adminOnly, upload.single('bannerImage'), createOffer);
router.put('/:id',       protect, adminOnly, validateObjectId(), upload.single('bannerImage'), updateOffer);
router.delete('/:id',    protect, adminOnly, validateObjectId(), deleteOffer);

module.exports = router;
