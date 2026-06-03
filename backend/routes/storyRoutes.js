const express  = require('express');
const router   = express.Router();
const { getStories, getAllStories, createStory, updateStory, deleteStory } = require('../controllers/storyController');
const { protect, adminOnly } = require('../middleware/auth');
const { validateObjectId }   = require('../middleware/rbac');
const { upload }             = require('../config/cloudinary');

router.get('/',           getStories);   // public
router.get('/admin/all',  protect, adminOnly, getAllStories);
router.post('/',          protect, adminOnly, upload.single('image'), createStory);
router.put('/:id',        protect, adminOnly, validateObjectId(), upload.single('image'), updateStory);
router.delete('/:id',     protect, adminOnly, validateObjectId(), deleteStory);

module.exports = router;
