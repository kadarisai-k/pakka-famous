const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, adminOnly } = require('../middleware/auth');
const SpecialCategory = require('../models/SpecialCategory');
const SpecialProduct  = require('../models/SpecialProduct');

// ── Cloudinary config (reads from env, same as rest of backend) ────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload  = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const deleteFromCloudinary = async (publicId) => {
  if (publicId) {
    try { await cloudinary.uploader.destroy(publicId); } catch (_) {}
  }
};

// ─────────────────────────────────────────────────────────────────
//  CATEGORY ROUTES
// ─────────────────────────────────────────────────────────────────

// GET /api/specials/categories  — public
router.get('/categories', async (req, res, next) => {
  try {
    const cats = await SpecialCategory.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
});

// GET /api/specials/categories/admin  — admin
router.get('/categories/admin', protect, adminOnly, async (req, res, next) => {
  try {
    const cats = await SpecialCategory.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
});

// POST /api/specials/categories  — admin
router.post('/categories', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const { name, description, order } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    // Generate slug from name
    const baseSlug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await SpecialCategory.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    let image = { url: '', publicId: '' };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'pakka-specials/categories');
      image = { url: result.secure_url, publicId: result.public_id };
    }

    const category = await SpecialCategory.create({
      name, slug, description, image,
      order: Number(order) || 0,
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
});

// PUT /api/specials/categories/:id  — admin
router.put('/categories/:id', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const cat = await SpecialCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    const { name, description, order, isActive } = req.body;
    if (name) {
      cat.name = name;
      // Regenerate slug only if name changed and slug not manually set
      const baseSlug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (await SpecialCategory.findOne({ slug, _id: { $ne: cat._id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      cat.slug = slug;
    }
    if (description !== undefined) cat.description = description;
    if (order      !== undefined) cat.order        = Number(order);
    if (isActive   !== undefined) cat.isActive      = isActive === 'true' || isActive === true;

    if (req.file) {
      await deleteFromCloudinary(cat.image?.publicId);
      const result = await uploadToCloudinary(req.file.buffer, 'pakka-specials/categories');
      cat.image = { url: result.secure_url, publicId: result.public_id };
    }

    await cat.save();
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
});

// DELETE /api/specials/categories/:id  — admin
router.delete('/categories/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const cat = await SpecialCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    // Delete all products in this category
    const products = await SpecialProduct.find({ categoryId: cat._id });
    for (const p of products) {
      await deleteFromCloudinary(p.image?.publicId);
    }
    await SpecialProduct.deleteMany({ categoryId: cat._id });
    await deleteFromCloudinary(cat.image?.publicId);
    await cat.deleteOne();

    res.json({ success: true, message: 'Category and its products deleted.' });
  } catch (err) { next(err); }
});

// POST /api/specials/categories/reorder  — admin
router.post('/categories/reorder', protect, adminOnly, async (req, res, next) => {
  try {
    const { order } = req.body; // array of { id, order }
    if (!Array.isArray(order)) return res.status(400).json({ success: false, message: 'order array required.' });
    await Promise.all(order.map(({ id, order: o }) =>
      SpecialCategory.findByIdAndUpdate(id, { order: Number(o) })
    ));
    res.json({ success: true, message: 'Order updated.' });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────
//  PRODUCT ROUTES
// ─────────────────────────────────────────────────────────────────

// GET /api/specials/products  — public
// ?category=<id|slug>  ?tag=trending  ?search=rice  ?page=1  ?limit=20
router.get('/products', async (req, res, next) => {
  try {
    const { category, tag, search, page = 1, limit = 40 } = req.query;
    const filter = {};

    if (category) {
      // accept ObjectId or slug
      const cat = category.match(/^[0-9a-fA-F]{24}$/)
        ? await SpecialCategory.findById(category)
        : await SpecialCategory.findOne({ slug: category });
      if (!cat) return res.json({ success: true, data: [], total: 0 });
      filter.categoryId = cat._id;
    }

    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    const total = await SpecialProduct.countDocuments(filter);
    const products = await SpecialProduct.find(filter)
      .populate('categoryId', 'name slug')
      .sort({ order: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, data: products, total, page: Number(page) });
  } catch (err) { next(err); }
});

// GET /api/specials/products/admin  — admin (all products, paginated)
router.get('/products/admin', protect, adminOnly, async (req, res, next) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const filter = category ? { categoryId: category } : {};
    const total   = await SpecialProduct.countDocuments(filter);
    const products = await SpecialProduct.find(filter)
      .populate('categoryId', 'name slug')
      .sort({ order: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ success: true, data: products, total });
  } catch (err) { next(err); }
});

// POST /api/specials/products  — admin
router.post('/products', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const { name, price, description, famousLocation, categoryId, isAvailable, tags, order } = req.body;
    if (!name || !price || !categoryId)
      return res.status(400).json({ success: false, message: 'name, price, categoryId are required.' });

    const cat = await SpecialCategory.findById(categoryId);
    if (!cat) return res.status(400).json({ success: false, message: 'Category not found.' });

    let image = { url: '', publicId: '' };
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'pakka-specials/products');
      image = { url: result.secure_url, publicId: result.public_id };
    }

    const parsedTags = Array.isArray(tags) ? tags : (tags ? JSON.parse(tags) : []);

    const product = await SpecialProduct.create({
      name, price: Number(price), description, famousLocation, categoryId,
      isAvailable: isAvailable !== 'false' && isAvailable !== false,
      tags: parsedTags,
      order: Number(order) || 0,
      image,
    });

    res.status(201).json({ success: true, data: await product.populate('categoryId', 'name slug') });
  } catch (err) { next(err); }
});

// PUT /api/specials/products/:id  — admin
router.put('/products/:id', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    const product = await SpecialProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { name, price, description, famousLocation, categoryId, isAvailable, tags, order } = req.body;

    if (name)            product.name           = name;
    if (price !== undefined) product.price      = Number(price);
    if (description !== undefined) product.description = description;
    if (famousLocation !== undefined) product.famousLocation = famousLocation;
    if (categoryId)      product.categoryId     = categoryId;
    if (isAvailable !== undefined) product.isAvailable = isAvailable !== 'false' && isAvailable !== false;
    if (tags !== undefined) product.tags        = Array.isArray(tags) ? tags : (tags ? JSON.parse(tags) : []);
    if (order !== undefined) product.order      = Number(order);

    if (req.file) {
      await deleteFromCloudinary(product.image?.publicId);
      const result = await uploadToCloudinary(req.file.buffer, 'pakka-specials/products');
      product.image = { url: result.secure_url, publicId: result.public_id };
    }

    await product.save();
    res.json({ success: true, data: await product.populate('categoryId', 'name slug') });
  } catch (err) { next(err); }
});

// PATCH /api/specials/products/:id/toggle  — admin (quick availability toggle)
router.patch('/products/:id/toggle', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await SpecialProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json({ success: true, data: { isAvailable: product.isAvailable } });
  } catch (err) { next(err); }
});

// DELETE /api/specials/products/:id  — admin
router.delete('/products/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await SpecialProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    await deleteFromCloudinary(product.image?.publicId);
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) { next(err); }
});

// GET /api/specials/summary  — public: categories + their products (grouped)
router.get('/summary', async (req, res, next) => {
  try {
    const cats = await SpecialCategory.find({ isActive: true }).sort({ order: 1 });
    const products = await SpecialProduct.find({ isAvailable: true }).sort({ order: 1 });

    const productsByCategory = {};
    for (const p of products) {
      const key = p.categoryId.toString();
      if (!productsByCategory[key]) productsByCategory[key] = [];
      productsByCategory[key].push(p);
    }

    const data = cats.map(cat => ({
      ...cat.toObject(),
      products: productsByCategory[cat._id.toString()] || [],
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;
