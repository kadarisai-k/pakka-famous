const SpecialOffer = require('../models/SpecialOffer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

// Public: get live offer (today's special) + upcoming offers + active popup
const getLiveOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  const all = await SpecialOffer.find({ isActive: true })
    .populate('featuredProducts', 'name city price discount weightPrices image isBestSelling')
    .sort({ startDate: 1 });

  const live     = all.filter(o => now >= o.startDate && now <= o.endDate);
  const upcoming = all.filter(o => now < o.startDate);
  const popup    = live.find(o => o.showPopup) || null;

  res.json({ success: true, live, upcoming, popup });
});

// Admin: get all
const getAllOffers = asyncHandler(async (req, res) => {
  const offers = await SpecialOffer.find()
    .populate('featuredProducts', 'name city price image')
    .sort({ startDate: -1 });
  res.json({ success: true, offers });
});

// Admin: create
const createOffer = asyncHandler(async (req, res) => {
  const { title, subtitle, description, startDate, endDate,
          perks, showPopup, popupBgColor, couponCode, couponPercent,
          featuredProducts } = req.body;

  let bannerImage = { url: '', publicId: '' };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'pakka-famous/offers');
    bannerImage = { url: result.secure_url, publicId: result.public_id };
  }

  const offer = await SpecialOffer.create({
    title, subtitle, description,
    startDate: new Date(startDate),
    endDate:   new Date(endDate),
    perks:     perks ? JSON.parse(perks) : [],
    showPopup:    showPopup === 'true',
    popupBgColor: popupBgColor || '#E8001D',
    couponCode:   couponCode || '',
    couponPercent: Number(couponPercent) || 0,
    featuredProducts: featuredProducts ? JSON.parse(featuredProducts) : [],
    bannerImage,
  });

  res.status(201).json({ success: true, offer });
});

// Admin: update
const updateOffer = asyncHandler(async (req, res) => {
  const offer = await SpecialOffer.findById(req.params.id);
  if (!offer) return res.status(404).json({ success: false, message: 'Not found' });

  const fields = ['title','subtitle','description','startDate','endDate',
                  'showPopup','popupBgColor','couponCode','couponPercent','isActive'];
  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      if (f === 'startDate' || f === 'endDate') offer[f] = new Date(req.body[f]);
      else if (f === 'showPopup' || f === 'isActive') offer[f] = req.body[f] === 'true' || req.body[f] === true;
      else if (f === 'couponPercent') offer[f] = Number(req.body[f]) || 0;
      else offer[f] = req.body[f];
    }
  });
  if (req.body.perks)             offer.perks             = JSON.parse(req.body.perks);
  if (req.body.featuredProducts)  offer.featuredProducts  = JSON.parse(req.body.featuredProducts);

  if (req.file) {
    if (offer.bannerImage?.publicId) await deleteFromCloudinary(offer.bannerImage.publicId);
    const result = await uploadToCloudinary(req.file.buffer, 'pakka-famous/offers');
    offer.bannerImage = { url: result.secure_url, publicId: result.public_id };
  }

  await offer.save();
  await offer.populate('featuredProducts', 'name city price image');
  res.json({ success: true, offer });
});

// Admin: delete
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await SpecialOffer.findById(req.params.id);
  if (!offer) return res.status(404).json({ success: false, message: 'Not found' });
  if (offer.bannerImage?.publicId) await deleteFromCloudinary(offer.bannerImage.publicId);
  await offer.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

module.exports = { getLiveOffers, getAllOffers, createOffer, updateOffer, deleteOffer };
