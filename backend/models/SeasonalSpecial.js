const mongoose = require('mongoose');

const seasonalSpecialSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String, required: true,
    enum: ['Corporate Gifting','NRI Packing','Birthday','Wedding','Festival','Other']
  },
  image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  order:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SeasonalSpecial', seasonalSpecialSchema);
