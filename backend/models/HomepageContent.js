const mongoose = require('mongoose');

const shopImageSchema = new mongoose.Schema({
  url:         { type: String, default: '' },
  publicId:    { type: String, default: '' },
  shopName:    { type: String, default: '' },
  city:        { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const homepageContentSchema = new mongoose.Schema({
  // Logo
  logo: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },

  // Hero
  heroTitle:       { type: String, default: 'Taste the Authentic Andhra Sweets 🍬' },
  heroSubtitle:    { type: String, default: 'From the golden shores of Kakinada to the sacred hills of Tirupati — experience the rich heritage of Andhra Pradesh.' },
  heroButtonText:  { type: String, default: 'Shop Now' },
  heroImage:       { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  heroOverlay:     { type: Number, default: 0.35 }, // 0–1

  // Featured section
  featuredTitle:    { type: String, default: '⭐ Featured Sweets' },
  featuredSubtitle: { type: String, default: 'Our most loved sweets, handpicked for you' },

  // Shop images gallery (right side of featured section)
  shopImages: [shopImageSchema],

  // Best selling
  bestSellingTitle:    { type: String, default: '🔥 Best Selling Sweets' },
  bestSellingSubtitle: { type: String, default: "Most ordered by our customers — don't miss these!" },

  // Seasonal / occasions
  seasonalTitle:    { type: String, default: '🎁 Special Occasions & Corporate Orders' },
  seasonalSubtitle: { type: String, default: 'We cater to every occasion with authentic Andhra flavours' },

  // Why choose
  whyChooseTitle:       { type: String, default: '💎 Why Choose Pakka Famous?' },
  whyChooseDescription: { type: String, default: 'We bring the best of Andhra Pradesh straight to your home' },

  // Offer banner
  offerBannerText:    { type: String, default: '🎁 Special Festival Offers' },
  offerBannerSubtext: { type: String, default: 'Order above ₹500 and get FREE delivery! Use code PAKKA10 for 10% off.' },

  // Top announcement ribbon
  announcementText: { type: String, default: '🎁 Free delivery on orders above ₹500 | Use code PAKKA10 for 10% off' },

  // Today's special offer
  todayOfferTitle:    { type: String, default: "🎉 Today's Special Offer" },
  todayOfferBannerImage: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
  todayOfferCouponCode:    { type: String, default: '' },
  todayOfferCouponPercent: { type: Number, default: 0 },
  todayOfferSubtitle: { type: String, default: "Grab today's exclusive deals — available for a limited time only!" },

  // Upcoming special offers
  upcomingOffersTitle:    { type: String, default: '📅 Upcoming Special Offers' },
  upcomingOffersSubtitle: { type: String, default: 'Stay tuned — amazing deals are on their way!' },
  upcomingOffers: [{ title: String, description: String, icon: String, color: String }],
}, { timestamps: true });

module.exports = mongoose.model('HomepageContent', homepageContentSchema);
