const mongoose = require('mongoose');

const occasionSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  emoji:       { type: String, default: '🎁' },
  image:    { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

occasionSchema.index({ isActive: 1, order: 1 });
module.exports = mongoose.model('Occasion', occasionSchema);
