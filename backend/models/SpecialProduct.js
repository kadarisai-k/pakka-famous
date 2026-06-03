const mongoose = require('mongoose');

const specialProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    url:      { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  famousLocation: {
    type: String,
    default: '',
    trim: true,
    maxlength: 100,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpecialCategory',
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  tags: {
    type: [String],
    enum: ['trending', 'festival', 'seasonal', 'new', 'bestseller'],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

specialProductSchema.index({ categoryId: 1, order: 1 });
specialProductSchema.index({ name: 'text', description: 'text', famousLocation: 'text' });

module.exports = mongoose.model('SpecialProduct', specialProductSchema);
