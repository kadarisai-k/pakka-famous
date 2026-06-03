const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title:       { type: String, required: true },
  city:        { type: String, required: true },
  history:     { type: String, required: true },
  description: { type: String, required: true },
  image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
