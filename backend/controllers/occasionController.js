const Occasion = require('../models/Occasion');
const Packing  = require('../models/Packing');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

// PUBLIC
const getOccasions = asyncHandler(async (req, res) => {
  const occasions = await Occasion.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, occasions });
});

// ADMIN
const getAllOccasions = asyncHandler(async (req, res) => {
  const occasions = await Occasion.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, occasions });
});

const createOccasion = asyncHandler(async (req, res) => {
  const { title, description, emoji, order } = req.body;
  if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title required' });
  let image = { url: '', publicId: '' };
  if (req.file) {
    const r = await uploadToCloudinary(req.file.buffer, 'pakka-famous/occasions');
    image = { url: r.secure_url, publicId: r.public_id };
  }
  const occasion = await Occasion.create({
    title: title.trim(), description: description || '',
    emoji: emoji || '🎁', image, order: Number(order) || 0,
  });
  res.status(201).json({ success: true, occasion });
});

const updateOccasion = asyncHandler(async (req, res) => {
  const occasion = await Occasion.findById(req.params.id);
  if (!occasion) return res.status(404).json({ success: false, message: 'Not found' });
  const { title, description, emoji, order, isActive } = req.body;
  if (title !== undefined)       occasion.title       = title.trim();
  if (description !== undefined) occasion.description = description;
  if (emoji !== undefined)       occasion.emoji       = emoji;
  if (order !== undefined)       occasion.order       = Number(order) || 0;
  if (isActive !== undefined)    occasion.isActive    = isActive === 'true' || isActive === true;
  if (req.file) {
    if (occasion.image?.publicId) await deleteFromCloudinary(occasion.image.publicId);
    const r = await uploadToCloudinary(req.file.buffer, 'pakka-famous/occasions');
    occasion.image = { url: r.secure_url, publicId: r.public_id };
  }
  await occasion.save();
  // Update denormalized title in all linked packings
  await Packing.updateMany({ occasionId: occasion._id }, { $set: { occasionTitle: occasion.title } });
  res.json({ success: true, occasion });
});

const deleteOccasion = asyncHandler(async (req, res) => {
  const occasion = await Occasion.findById(req.params.id);
  if (!occasion) return res.status(404).json({ success: false, message: 'Not found' });
  if (occasion.image?.publicId) await deleteFromCloudinary(occasion.image.publicId);
  // Cascade-delete all packings under this occasion
  const packings = await Packing.find({ occasionId: occasion._id });
  for (const p of packings) {
    if (p.image?.publicId) await deleteFromCloudinary(p.image.publicId);
    await p.deleteOne();
  }
  await occasion.deleteOne();
  res.json({ success: true, message: 'Occasion and all its packages deleted' });
});

module.exports = { getOccasions, getAllOccasions, createOccasion, updateOccasion, deleteOccasion };
