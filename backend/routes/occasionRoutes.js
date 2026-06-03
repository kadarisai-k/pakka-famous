const express = require('express');
const router  = express.Router();
const { getOccasions, getAllOccasions, createOccasion, updateOccasion, deleteOccasion } = require('../controllers/occasionController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { upload }             = require('../config/cloudinary');

router.get('/',           getOccasions);                                               // public
router.get('/admin/all',  protect, adminOnly, getAllOccasions);                        // admin
router.post('/',          protect, adminOnly, upload.single('image'), createOccasion); // admin
router.put('/:id',        protect, adminOnly, validateObjectId(), upload.single('image'), updateOccasion);
router.delete('/:id',     protect, adminOnly, validateObjectId(), deleteOccasion);

module.exports = router;
