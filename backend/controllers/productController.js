const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

const getTodaySpecial = asyncHandler(async (req, res) => {
  let products = await Product.find({ isTodaySpecial: true, isActive: true })
    .limit(8).select('-__v');
  res.json({ success: true, products });
});

const getProducts = asyncHandler(async (req, res) => {
  const { search, city, category, sort, page = 1, limit = 12, seasonal } = req.query;
  const safePage  = Math.max(1, parseInt(page));
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit)));

  let query = { isActive: true };
  if (search) {
    query.$text = { $search: search }; // uses text index on Product model
  }
  if (city)     query.city     = { $regex: city, $options: 'i' };
  if (category) query.category = category;
  if (seasonal === 'true') query.isSeasonalCollection = true;

  let sortOption = {};
  switch (sort) {
    case 'price_asc':   sortOption = { price: 1 }; break;
    case 'price_desc':  sortOption = { price: -1 }; break;
    case 'newest':      sortOption = { createdAt: -1 }; break;
    case 'bestselling': sortOption = { salesCount: -1 }; break;
    default:            sortOption = { isFeatured: -1, createdAt: -1 };
  }

  const [total, products] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query)
      .sort(sortOption)
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .select('-__v'),
  ]);

  res.json({
    success: true,
    products,
    pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit), limit: safeLimit },
  });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(10).select('-__v');
  res.json({ success: true, products });
});

const getTopSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isTopSeller: true, isActive: true }).limit(10).select('-__v');
  res.json({ success: true, products });
});

const getBestSellingProducts = asyncHandler(async (req, res) => {
  let products = await Product.find({ isBestSelling: true, isActive: true }).limit(8).select('-__v');
  if (products.length < 3) products = await Product.find({ isActive: true }).sort({ salesCount: -1 }).limit(8).select('-__v');
  if (products.length < 3) products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8).select('-__v');
  res.json({ success: true, products });
});

const getSeasonalProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isSeasonalCollection: true }).limit(8).select('-__v');
  res.json({ success: true, products });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

const getCities = asyncHandler(async (req, res) => {
  const cities = await Product.distinct('city', { isActive: true });
  res.json({ success: true, cities: cities.filter(Boolean).sort() });
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    name, city, description, price, discount, weight, category,
    isFeatured, isTopSeller, isBestSelling, availableQty,
    isSeasonalCollection, seasonalTag, weightPrices,
    shopWhatsapp, shopName,
  } = req.body;

  if (!name || !city || !description || !category) {
    return res.status(400).json({ success: false, message: 'Name, city, description and category are required.' });
  }

  let parsedWeightPrices = [];
  if (weightPrices) {
    try { parsedWeightPrices = typeof weightPrices === 'string' ? JSON.parse(weightPrices) : weightPrices; }
    catch { parsedWeightPrices = []; }
  }
  if (!parsedWeightPrices.length && price && weight) {
    parsedWeightPrices = [{ weight, price: Number(price) }];
  }

  const basePrice = parsedWeightPrices.length ? parsedWeightPrices[0].price : Number(price);
  if (!basePrice || basePrice < 1) {
    return res.status(400).json({ success: false, message: 'Price is required.' });
  }

  let image = { url: '', publicId: '' };
  let hoverImage = { url: '', publicId: '' };
  const files = req.files || {};
  if (files.image?.[0]) {
    const r = await uploadToCloudinary(files.image[0].buffer);
    image = { url: r.secure_url, publicId: r.public_id };
  }
  if (files.hoverImage?.[0]) {
    const r = await uploadToCloudinary(files.hoverImage[0].buffer);
    hoverImage = { url: r.secure_url, publicId: r.public_id };
  }

  const product = await Product.create({
    name, city, description,
    price: basePrice,
    weightPrices: parsedWeightPrices,
    discount: Number(discount) || 0,
    availableQty: availableQty ? Number(availableQty) : null,
    weight: parsedWeightPrices.length ? parsedWeightPrices[0].weight : (weight || ''),
    category,
    isFeatured:           isFeatured === 'true'           || isFeatured === true,
    isTopSeller:          isTopSeller === 'true'          || isTopSeller === true,
    isBestSelling:        isBestSelling === 'true'        || isBestSelling === true,
    isSeasonalCollection: isSeasonalCollection === 'true' || isSeasonalCollection === true,
    seasonalTag: seasonalTag || '',
    shopWhatsapp: shopWhatsapp || '',
    shopName: shopName || '',
    image, hoverImage,
  });

  res.status(201).json({ success: true, message: 'Product created!', product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const {
    name, city, description, price, discount, weight, category,
    isFeatured, isTopSeller, isBestSelling, availableQty,
    isSeasonalCollection, seasonalTag, weightPrices,
    shopWhatsapp, shopName,
  } = req.body;

  let parsedWeightPrices = [];
  if (weightPrices) {
    try { parsedWeightPrices = typeof weightPrices === 'string' ? JSON.parse(weightPrices) : weightPrices; }
    catch { parsedWeightPrices = []; }
  }
  if (!parsedWeightPrices.length && price && weight) {
    parsedWeightPrices = [{ weight, price: Number(price) }];
  }

  if (name !== undefined)        product.name        = name;
  if (city !== undefined)        product.city        = city;
  if (description !== undefined) product.description = description;
  if (category !== undefined)    product.category    = category;
  if (discount !== undefined)    product.discount    = Number(discount);
  if (availableQty !== undefined) product.availableQty = availableQty ? Number(availableQty) : null;
  if (parsedWeightPrices.length) {
    product.weightPrices = parsedWeightPrices;
    product.price = parsedWeightPrices[0].price;
    product.weight = parsedWeightPrices[0].weight;
  } else if (price !== undefined) {
    product.price = Number(price);
  }
  if (weight !== undefined && !parsedWeightPrices.length) product.weight = weight;
  if (isFeatured !== undefined)    product.isFeatured    = isFeatured    === 'true' || isFeatured    === true;
  if (isTopSeller !== undefined)   product.isTopSeller   = isTopSeller   === 'true' || isTopSeller   === true;
  if (isBestSelling !== undefined) product.isBestSelling = isBestSelling === 'true' || isBestSelling === true;
  if (isSeasonalCollection !== undefined) product.isSeasonalCollection = isSeasonalCollection === 'true' || isSeasonalCollection === true;
  if (seasonalTag !== undefined)   product.seasonalTag   = seasonalTag;
  if (shopWhatsapp !== undefined)  product.shopWhatsapp  = shopWhatsapp;
  if (shopName !== undefined)      product.shopName      = shopName;

  const updFiles = req.files || {};
  if (updFiles.image?.[0]) {
    if (product.image?.publicId) await deleteFromCloudinary(product.image.publicId);
    const r = await uploadToCloudinary(updFiles.image[0].buffer);
    product.image = { url: r.secure_url, publicId: r.public_id };
  }
  if (updFiles.hoverImage?.[0]) {
    if (product.hoverImage?.publicId) await deleteFromCloudinary(product.hoverImage.publicId);
    const r = await uploadToCloudinary(updFiles.hoverImage[0].buffer);
    product.hoverImage = { url: r.secure_url, publicId: r.public_id };
  }

  await product.save();
  res.json({ success: true, message: 'Product updated!', product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.image?.publicId)      await deleteFromCloudinary(product.image.publicId);
  if (product.hoverImage?.publicId) await deleteFromCloudinary(product.hoverImage.publicId);
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

const updateProductFlags = asyncHandler(async (req, res) => {
  const { isFeatured, isTopSeller, isBestSelling, isTodaySpecial, todaySpecialPrice } = req.body;
  const update = {};
  if (isFeatured    !== undefined) update.isFeatured    = isFeatured    === 'true' || isFeatured    === true;
  if (isTopSeller   !== undefined) update.isTopSeller   = isTopSeller   === 'true' || isTopSeller   === true;
  if (isBestSelling !== undefined) update.isBestSelling = isBestSelling === 'true' || isBestSelling === true;
  if (isTodaySpecial !== undefined) update.isTodaySpecial = isTodaySpecial === 'true' || isTodaySpecial === true;
  if (todaySpecialPrice !== undefined) update.todaySpecialPrice = Number(todaySpecialPrice) || 0;
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

module.exports = {
  getTodaySpecial, getProducts, getProduct, getFeaturedProducts,
  getTopSellerProducts, getBestSellingProducts, getSeasonalProducts,
  createProduct, updateProduct, updateProductFlags, deleteProduct, getCities,
};
