const mongoose = require('mongoose');

const specialCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  description: { type: String, default: '', maxlength: 300 },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

specialCategorySchema.index({ order: 1 });
specialCategorySchema.index({ slug: 1 });

module.exports = mongoose.model('SpecialCategory', specialCategorySchema);
