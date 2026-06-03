const Wishlist = require('../models/Wishlist');
const Product  = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate({ path: 'items.product', match: { isActive: true } });
  if (!wishlist) wishlist = { items: [] };
  const items = (wishlist.items || []).filter(i => i.product);
  res.json({ success: true, wishlist: { items } });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, items: [] });

  if (wishlist.items.find(i => i.product.toString() === productId)) {
    return res.json({ success: true, message: 'Already in wishlist' });
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();
  res.json({ success: true, message: 'Added to wishlist ❤️' });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.json({ success: true, message: 'Removed' });
  wishlist.items = wishlist.items.filter(i => i.product.toString() !== req.params.productId);
  await wishlist.save();
  res.json({ success: true, message: 'Removed from wishlist' });
});

const getWishlistIds = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  const ids = wishlist ? wishlist.items.map(i => i.product.toString()) : [];
  res.json({ success: true, ids });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist, getWishlistIds };
