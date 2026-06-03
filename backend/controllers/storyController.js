const Story = require('../models/Story');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

const getStories = asyncHandler(async (req, res) => {
  const stories = await Story.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, stories });
});

const getAllStories = asyncHandler(async (req, res) => {
  const stories = await Story.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, stories });
});

const createStory = asyncHandler(async (req, res) => {
  const { title, city, history, description, order } = req.body;
  let image = { url: '', publicId: '' };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'pakka-famous/stories');
    image = { url: result.secure_url, publicId: result.public_id };
  }
  const story = await Story.create({ title, city, history, description, order: order || 0, image });
  res.status(201).json({ success: true, story });
});

const updateStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  const { title, city, history, description, order, isActive } = req.body;
  if (title !== undefined)       story.title       = title;
  if (city !== undefined)        story.city        = city;
  if (history !== undefined)     story.history     = history;
  if (description !== undefined) story.description = description;
  if (order !== undefined)       story.order       = order;
  if (isActive !== undefined)    story.isActive    = isActive;
  if (req.file) {
    if (story.image?.publicId) await deleteFromCloudinary(story.image.publicId);
    const result = await uploadToCloudinary(req.file.buffer, 'pakka-famous/stories');
    story.image = { url: result.secure_url, publicId: result.public_id };
  }
  await story.save();
  res.json({ success: true, story });
});

const deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
  if (story.image?.publicId) await deleteFromCloudinary(story.image.publicId);
  await story.deleteOne();
  res.json({ success: true, message: 'Story deleted' });
});

module.exports = { getStories, getAllStories, createStory, updateStory, deleteStory };
