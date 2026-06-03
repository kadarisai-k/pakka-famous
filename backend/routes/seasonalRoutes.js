const express  = require('express');
const router   = express.Router();
const { getSeasonalSpecials, getAllSeasonalSpecials, createSeasonalSpecial, updateSeasonalSpecial, deleteSeasonalSpecial } = require('../controllers/seasonalController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { upload }             = require('../config/cloudinary');

router.get('/',           getSeasonalSpecials);   // public
router.get('/admin/all',  protect, adminOnly, getAllSeasonalSpecials);
router.post('/',          protect, adminOnly, upload.single('image'), createSeasonalSpecial);
router.put('/:id',        protect, adminOnly, validateObjectId(), upload.single('image'), updateSeasonalSpecial);
router.delete('/:id',     protect, adminOnly, validateObjectId(), deleteSeasonalSpecial);

module.exports = router;
