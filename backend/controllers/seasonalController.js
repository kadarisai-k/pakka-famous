const SeasonalSpecial = require('../models/SeasonalSpecial');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

const getSeasonalSpecials = asyncHandler(async (req, res) => {
  const specials = await SeasonalSpecial.find({ isActive: true }).sort({ order: 1 });
  res.json({ success: true, specials });
});

const getAllSeasonalSpecials = asyncHandler(async (req, res) => {
  const specials = await SeasonalSpecial.find().sort({ order: 1 });
  res.json({ success: true, specials });
});

const createSeasonalSpecial = asyncHandler(async (req, res) => {
  const { title, description, category, order } = req.body;
  let image = { url: '', publicId: '' };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'pakka-famous/seasonal');
    image = { url: result.secure_url, publicId: result.public_id };
  }
  const special = await SeasonalSpecial.create({ title, description, category, order: order || 0, image });
  res.status(201).json({ success: true, special });
});

const updateSeasonalSpecial = asyncHandler(async (req, res) => {
  const special = await SeasonalSpecial.findById(req.params.id);
  if (!special) return res.status(404).json({ success: false, message: 'Not found' });
  const { title, description, category, order, isActive } = req.body;
  if (title !== undefined)       special.title       = title;
  if (description !== undefined) special.description = description;
  if (category !== undefined)    special.category    = category;
  if (order !== undefined)       special.order       = order;
  if (isActive !== undefined)    special.isActive    = isActive;
  if (req.file) {
    if (special.image?.publicId) await deleteFromCloudinary(special.image.publicId);
    const result = await uploadToCloudinary(req.file.buffer, 'pakka-famous/seasonal');
    special.image = { url: result.secure_url, publicId: result.public_id };
  }
  await special.save();
  res.json({ success: true, special });
});

const deleteSeasonalSpecial = asyncHandler(async (req, res) => {
  const special = await SeasonalSpecial.findById(req.params.id);
  if (!special) return res.status(404).json({ success: false, message: 'Not found' });
  if (special.image?.publicId) await deleteFromCloudinary(special.image.publicId);
  await special.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

module.exports = { getSeasonalSpecials, getAllSeasonalSpecials, createSeasonalSpecial, updateSeasonalSpecial, deleteSeasonalSpecial };
