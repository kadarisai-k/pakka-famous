const mongoose = require('mongoose');

const weightPriceSchema = new mongoose.Schema({
  weight: { type: String, required: true },
  price:  { type: Number, required: true, min: 1 },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, maxlength: 100 },
  city:        { type: String, required: true, trim: true },
  description: { type: String, required: true, maxlength: 1000 },
  price:       { type: Number, default: 0 },
  weightPrices: [weightPriceSchema],
  discount:     { type: Number, default: 0, min: 0, max: 90 },
  weight:       { type: String, default: '' },
  availableQty: { type: Number, default: null },
  image:      { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  hoverImage: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  category: {
    type: String,
    default: 'Other',
    enum: ['Laddu','Kaja','Pootharekulu','Halwa','Burfi','Murukku','Payasam',
           'Pickle','Pappad','Chutney','Mixture','Chakralu','Gavvalu','Bobbatlu',
           'Pala Kova','Ariselu','Jilebi','Mysore Pak','Kheer','Other']
  },
  rating:  { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  isFeatured:           { type: Boolean, default: false },
  isTopSeller:          { type: Boolean, default: false },
  isBestSelling:        { type: Boolean, default: false },
  isTodaySpecial:       { type: Boolean, default: false },
  todaySpecialPrice:    { type: Number, default: 0 },
  salesCount:           { type: Number, default: 0 },
  isSeasonalCollection: { type: Boolean, default: false },
  seasonalTag: {
    type: String,
    enum: ['','Festival Special','Wedding Specials','Diwali Sweets','Sankranti Specials','Corporate Gifting','NRI Packing','Birthday','Other'],
    default: ''
  },
  isActive:     { type: Boolean, default: true },
  shopWhatsapp: { type: String, default: '' },
  shopName:     { type: String, default: '' },
}, { timestamps: true });

productSchema.virtual('discountedPrice').get(function () {
  return this.price - (this.price * this.discount / 100);
});
productSchema.set('toJSON', { virtuals: true });
productSchema.index({ name: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
