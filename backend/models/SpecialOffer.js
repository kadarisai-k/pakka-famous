const mongoose = require('mongoose');

const offerPerkSchema = new mongoose.Schema({
  icon:  { type: String, default: '🎁' },
  label: { type: String, default: '' },
  desc:  { type: String, default: '' },
  color: { type: String, default: '#E8001D' },
}, { _id: false });

const specialOfferSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },

  // Dates — offer auto-activates at startDate, auto-deactivates at endDate
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },

  // Offer perks shown in the banner (free delivery, discount code, etc.)
  perks: [offerPerkSchema],

  // Popup banner settings
  showPopup:    { type: Boolean, default: false },  // show as popup on homepage
  popupBgColor: { type: String, default: '#E8001D' },
  bannerImage:  { url: { type: String, default: '' }, publicId: { type: String, default: '' } },

  // Discount code to highlight
  couponCode:    { type: String, default: '' },
  couponPercent: { type: Number, default: 0 },

  // Which products to feature (if empty, uses isBestSelling products)
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  isActive: { type: Boolean, default: true }, // manual override kill-switch
}, { timestamps: true });

// Virtual: is this offer currently live?
specialOfferSchema.virtual('isLive').get(function () {
  if (!this.isActive) return false;
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual: is this offer upcoming?
specialOfferSchema.virtual('isUpcoming').get(function () {
  if (!this.isActive) return false;
  return new Date() < this.startDate;
});

specialOfferSchema.set('toJSON', { virtuals: true });
specialOfferSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('SpecialOffer', specialOfferSchema);
