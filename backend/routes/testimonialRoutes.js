const express = require('express');
const router  = express.Router();
const { getTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { upload }             = require('../config/cloudinary');

router.get('/',           getTestimonials);
router.get('/admin/all',  protect, adminOnly, getAllTestimonials);
router.post('/',          protect, adminOnly, upload.single('profileImage'), createTestimonial);
router.put('/:id',        protect, adminOnly, validateObjectId(), upload.single('profileImage'), updateTestimonial);
router.delete('/:id',     protect, adminOnly, validateObjectId(), deleteTestimonial);
module.exports = router;
