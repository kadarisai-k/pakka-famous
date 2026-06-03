const HomepageContent = require('../models/HomepageContent');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

const getHomepageContent = asyncHandler(async (req, res) => {
  let content = await HomepageContent.findOne();
  if (!content) content = await HomepageContent.create({});
  res.json({ success: true, content });
});

const updateHomepageContent = asyncHandler(async (req, res) => {
  let content = await HomepageContent.findOne();
  if (!content) content = new HomepageContent({});

  const allowedFields = [
    'heroTitle','heroSubtitle','heroButtonText','heroOverlay',
    'featuredTitle','featuredSubtitle',
    'bestSellingTitle','bestSellingSubtitle',
    'seasonalTitle','seasonalSubtitle',
    'whyChooseTitle','whyChooseDescription',
    'offerBannerText','offerBannerSubtext',
    'announcementText',
    'todayOfferTitle','todayOfferSubtitle','todayOfferCouponCode','todayOfferCouponPercent',
    'upcomingOffersTitle','upcomingOffersSubtitle',
  ];
  allowedFields.forEach(f => { if (req.body[f] !== undefined) content[f] = req.body[f]; });

  if (req.body.upcomingOffers) {
    try { content.upcomingOffers = JSON.parse(req.body.upcomingOffers); } catch {}
  }

  if (req.files?.heroImage?.[0]) {
    if (content.heroImage?.publicId) await deleteFromCloudinary(content.heroImage.publicId);
    const r = await uploadToCloudinary(req.files.heroImage[0].buffer, 'pakka-famous/hero');
    content.heroImage = { url: r.secure_url, publicId: r.public_id };
  }
  if (req.files?.todayOfferBannerImage?.[0]) {
    if (content.todayOfferBannerImage?.publicId) await deleteFromCloudinary(content.todayOfferBannerImage.publicId);
    const r = await uploadToCloudinary(req.files.todayOfferBannerImage[0].buffer, 'pakka-famous/today-special');
    content.todayOfferBannerImage = { url: r.secure_url, publicId: r.public_id };
  }
    if (req.files?.logo?.[0]) {
    if (content.logo?.publicId) await deleteFromCloudinary(content.logo.publicId);
    const r = await uploadToCloudinary(req.files.logo[0].buffer, 'pakka-famous/logo');
    content.logo = { url: r.secure_url, publicId: r.public_id };
  }

  await content.save();
  res.json({ success: true, content, message: 'Content updated!' });
});

const addShopImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Image required' });
  let content = await HomepageContent.findOne() || new HomepageContent({});
  const r = await uploadToCloudinary(req.file.buffer, 'pakka-famous/shops');
  content.shopImages.push({
    url: r.secure_url, publicId: r.public_id,
    shopName:    req.body.shopName    || '',
    city:        req.body.city        || '',
    description: req.body.description || '',
  });
  await content.save();
  res.json({ success: true, content, message: 'Shop image added!' });
});

const removeShopImage = asyncHandler(async (req, res) => {
  let content = await HomepageContent.findOne();
  if (!content) return res.status(404).json({ success: false, message: 'Not found' });
  const img = content.shopImages.find(i => i.publicId === req.params.publicId);
  if (img?.publicId) await deleteFromCloudinary(img.publicId);
  content.shopImages = content.shopImages.filter(i => i.publicId !== req.params.publicId);
  await content.save();
  res.json({ success: true, message: 'Shop image removed' });
});

const getAllCitySweets = asyncHandler(async (req, res) => {
  const CitySweet = require('../models/CitySweet');
  const items = await CitySweet.find().sort({ cityName: 1 });
  res.json({ success: true, citySweets: items });
});

const createCitySweet = asyncHandler(async (req, res) => {
  const CitySweet = require('../models/CitySweet');
  const { cityName, sweetName, description, lat, lng } = req.body;
  let image = { url: '', publicId: '' };
  if (req.file) {
    const r = await uploadToCloudinary(req.file.buffer, 'pakka-famous/city-sweets');
    image = { url: r.secure_url, publicId: r.public_id };
  }
  const item = await CitySweet.create({ cityName, sweetName, description, lat, lng, image });
  res.status(201).json({ success: true, citySweet: item });
});

const updateCitySweet = asyncHandler(async (req, res) => {
  const CitySweet = require('../models/CitySweet');
  const item = await CitySweet.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  const { cityName, sweetName, description, lat, lng } = req.body;
  if (cityName)    item.cityName    = cityName;
  if (sweetName)   item.sweetName   = sweetName;
  if (description) item.description = description;
  if (lat)         item.lat         = lat;
  if (lng)         item.lng         = lng;
  if (req.file) {
    if (item.image?.publicId) await deleteFromCloudinary(item.image.publicId);
    const r = await uploadToCloudinary(req.file.buffer, 'pakka-famous/city-sweets');
    item.image = { url: r.secure_url, publicId: r.public_id };
  }
  await item.save();
  res.json({ success: true, citySweet: item });
});

const deleteCitySweet = asyncHandler(async (req, res) => {
  const CitySweet = require('../models/CitySweet');
  const item = await CitySweet.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  if (item.image?.publicId) await deleteFromCloudinary(item.image.publicId);
  await item.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

module.exports = {
  getHomepageContent, updateHomepageContent, addShopImage, removeShopImage,
  getAllCitySweets, createCitySweet, updateCitySweet, deleteCitySweet,
};
