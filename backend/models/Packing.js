const mongoose = require('mongoose');

const sweetItemSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  name:       { type: String, required: true, trim: true },
  quantity:   { type: Number, default: 1 },
  unit:       { type: String, default: 'kg' },
  pricePerKg: { type: Number, default: 0 },
}, { _id: false });

const packingSchema = new mongoose.Schema({
  occasionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion', required: true },
  occasionTitle: { type: String, default: '' },   // denormalized for quick reads
  name:          { type: String, required: true, trim: true },
  description:   { type: String, default: '' },
  price:         { type: Number, default: 0 },
  totalQuantity: { type: Number, default: 0 },
  sweets:        [sweetItemSchema],
  image:    { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

packingSchema.index({ occasionId: 1, isActive: 1, order: 1 });
module.exports = mongoose.model('Packing', packingSchema);
