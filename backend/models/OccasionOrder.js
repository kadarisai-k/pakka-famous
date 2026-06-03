const mongoose = require('mongoose');

const occasionOrderSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  phone:         { type: String, required: true, trim: true },
  email:         { type: String, default: '', trim: true },
  occasionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Occasion', default: null },
  occasionTitle: { type: String, default: '' },
  packingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Packing', default: null },
  packingName:   { type: String, default: '' },
  selectedSweets:{ type: String, default: '' },
  quantity:      { type: Number, default: 1 },
  totalPrice:    { type: Number, default: 0 },
  deliveryDate:  { type: Date, default: null },
  notes:         { type: String, default: '' },
  deliveryAddress: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('OccasionOrder', occasionOrderSchema);
