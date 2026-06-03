const mongoose = require('mongoose');

const citySweetSchema = new mongoose.Schema({
  cityName:    { type: String, required: true, trim: true },
  sweetName:   { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  // Lat/lng for map marker positioning (Andhra Pradesh cities)
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  image: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('CitySweet', citySweetSchema);
