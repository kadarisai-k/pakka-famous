const Packing = require('../models/Packing');
const Occasion = require('../models/Occasion');
const OccasionOrder = require('../models/OccasionOrder');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');

// PUBLIC: all active packings (optional ?occasionId=xxx filter)
const getPackings = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.occasionId) filter.occasionId = req.query.occasionId;
  const packings = await Packing.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, packings });
});

// PUBLIC: packings for a specific occasion
const getPackingsByOccasion = asyncHandler(async (req, res) => {
  const packings = await Packing.find({ occasionId: req.params.occasionId, isActive: true })
    .sort({ order: 1, createdAt: -1 });
  res.json({ success: true, packings });
});

// ADMIN: all packings (optional ?occasionId filter)
const getAllPackings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.occasionId) filter.occasionId = req.query.occasionId;
  const packings = await Packing.find(filter).sort({ occasionId: 1, order: 1 });
  res.json({ success: true, packings });
});

// ADMIN: create
const createPacking = asyncHandler(async (req, res) => {
  const { occasionId, name, description, price, totalQuantity, order, sweets } = req.body;
  if (!name?.trim() || !occasionId)
    return res.status(400).json({ success: false, message: 'Name and occasionId required' });
  const occasion = await Occasion.findById(occasionId);
  if (!occasion) return res.status(404).json({ success: false, message: 'Occasion not found' });
  let image = { url: '', publicId: '' };
  if (req.file) {
    const r = await uploadToCloudinary(req.file.buffer, 'pakka-famous/packings');
    image = { url: r.secure_url, publicId: r.public_id };
  }
  const packing = await Packing.create({
    occasionId, occasionTitle: occasion.title,
    name: name.trim(), description: description || '',
    price: Number(price) || 0, totalQuantity: Number(totalQuantity) || 0,
    order: Number(order) || 0,
    sweets: sweets ? JSON.parse(sweets) : [],
    image,
  });
  res.status(201).json({ success: true, packing });
});

// ADMIN: update
const updatePacking = asyncHandler(async (req, res) => {
  const packing = await Packing.findById(req.params.id);
  if (!packing) return res.status(404).json({ success: false, message: 'Not found' });
  const { occasionId, name, description, price, totalQuantity, order, isActive, sweets } = req.body;
  if (occasionId) {
    const occ = await Occasion.findById(occasionId);
    if (occ) { packing.occasionId = occasionId; packing.occasionTitle = occ.title; }
  }
  if (name !== undefined)          packing.name          = name.trim();
  if (description !== undefined)   packing.description   = description;
  if (price !== undefined)         packing.price         = Number(price) || 0;
  if (totalQuantity !== undefined) packing.totalQuantity = Number(totalQuantity) || 0;
  if (order !== undefined)         packing.order         = Number(order) || 0;
  if (isActive !== undefined)      packing.isActive      = isActive === 'true' || isActive === true;
  if (sweets !== undefined)        packing.sweets        = JSON.parse(sweets);
  if (req.file) {
    if (packing.image?.publicId) await deleteFromCloudinary(packing.image.publicId);
    const r = await uploadToCloudinary(req.file.buffer, 'pakka-famous/packings');
    packing.image = { url: r.secure_url, publicId: r.public_id };
  }
  await packing.save();
  res.json({ success: true, packing });
});

// ADMIN: delete
const deletePacking = asyncHandler(async (req, res) => {
  const packing = await Packing.findById(req.params.id);
  if (!packing) return res.status(404).json({ success: false, message: 'Not found' });
  if (packing.image?.publicId) await deleteFromCloudinary(packing.image.publicId);
  await packing.deleteOne();
  res.json({ success: true });
});

// PUBLIC: submit occasion order
const createOccasionOrder = asyncHandler(async (req, res) => {
  const { name, phone, email, occasionId, occasionTitle, packingId, packingName,
          selectedSweets, quantity, totalPrice, deliveryDate, notes, deliveryAddress } = req.body;
  if (!name?.trim() || !phone?.trim())
    return res.status(400).json({ success: false, message: 'Name and phone required' });
  const order = await OccasionOrder.create({
    name, phone, email: email || '',
    occasionId: occasionId || null, occasionTitle: occasionTitle || '',
    packingId: packingId || null, packingName: packingName || '',
    selectedSweets: selectedSweets || '', quantity: Number(quantity) || 1,
    totalPrice: Number(totalPrice) || 0,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
    notes: notes || '',
    deliveryAddress: deliveryAddress || { street:'', city:'', state:'', pincode:'' },
  });
  res.status(201).json({ success: true, order, message: 'Order received!' });
});

// ADMIN: list all occasion orders
const getOccasionOrders = asyncHandler(async (req, res) => {
  const orders = await OccasionOrder.find().sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// ADMIN: update order status
const updateOccasionOrder = asyncHandler(async (req, res) => {
  const order = await OccasionOrder.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Not found' });
  if (req.body.status) order.status = req.body.status;
  await order.save();
  res.json({ success: true, order });
});

module.exports = {
  getPackings, getPackingsByOccasion, getAllPackings,
  createPacking, updatePacking, deletePacking,
  createOccasionOrder, getOccasionOrders, updateOccasionOrder,
};
