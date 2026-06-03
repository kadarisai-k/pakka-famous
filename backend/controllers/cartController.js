const Cart    = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, weight } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

  const qty = Math.max(1, Math.min(99, parseInt(quantity)));
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
  }

  // Determine price: check todaySpecialPrice first, then weightPrices, then discounted price
  let itemPrice;
  let selectedWeight = weight || '';

  // Today's Special override price takes highest priority
  if (product.isTodaySpecial && product.todaySpecialPrice > 0) {
    itemPrice = product.todaySpecialPrice;
    // Still resolve weight for display
    if (weight && product.weightPrices?.length > 0) {
      const wp = product.weightPrices.find(w => w.weight === weight);
      selectedWeight = wp ? wp.weight : product.weightPrices[0].weight;
    } else if (product.weightPrices?.length > 0) {
      selectedWeight = product.weightPrices[0].weight;
    }
  } else if (weight && product.weightPrices && product.weightPrices.length > 0) {
    const wp = product.weightPrices.find(w => w.weight === weight);
    itemPrice = wp ? wp.price : product.weightPrices[0].price;
    selectedWeight = wp ? wp.weight : product.weightPrices[0].weight;
  } else if (product.weightPrices && product.weightPrices.length > 0) {
    itemPrice = product.weightPrices[0].price;
    selectedWeight = product.weightPrices[0].weight;
  } else {
    itemPrice = +(product.price - (product.price * product.discount / 100)).toFixed(2);
  }

  let cart = await Cart.findOne({ user: req.user._id }) || new Cart({ user: req.user._id, items: [] });

  // Match by both product ID AND weight (different weights = different cart items)
  const idx = cart.items.findIndex(i =>
    i.product.toString() === productId && i.selectedWeight === selectedWeight
  );

  if (idx > -1) {
    cart.items[idx].quantity = Math.min(99, cart.items[idx].quantity + qty);
  } else {
    cart.items.push({ product: productId, quantity: qty, price: itemPrice, selectedWeight });
  }

  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, message: 'Added to cart!', cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity, weight } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  // Find by product + weight if weight provided
  let idx;
  if (weight) {
    idx = cart.items.findIndex(i => i.product.toString() === productId && i.selectedWeight === weight);
  } else {
    idx = cart.items.findIndex(i => i.product.toString() === productId);
  }
  if (idx === -1) return res.status(404).json({ success: false, message: 'Item not in cart' });

  if (quantity <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].quantity = Math.min(99, parseInt(quantity));
  }

  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, message: 'Cart updated!', cart });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  const { weight } = req.query;
  if (weight) {
    cart.items = cart.items.filter(i =>
      !(i.product.toString() === req.params.productId && i.selectedWeight === weight)
    );
  } else {
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  }
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, message: 'Removed from cart!', cart });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
  res.json({ success: true, message: 'Cart cleared!' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
