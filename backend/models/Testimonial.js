const mongoose = require('mongoose');
const testimonialSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  review:      { type: String, required: true, trim: true },
  rating:      { type: Number, required: true, min: 1, max: 5, default: 5 },
  designation: { type: String, default: '' },
  profileImage: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });
testimonialSchema.index({ isActive: 1, order: 1, createdAt: -1 });
module.exports = mongoose.model('Testimonial', testimonialSchema);
