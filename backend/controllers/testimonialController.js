const Testimonial  = require('../models/Testimonial');
const asyncHandler = require('../middleware/asyncHandler');

const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, testimonials });
});

const getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, testimonials });
});

const createTestimonial = asyncHandler(async (req, res) => {
  const { name, review, rating, designation, isActive, order } = req.body;
  if (!name || !review) return res.status(400).json({ success: false, message: 'Name and review are required.' });
  const data = {
    name, review,
    rating:      Math.min(5, Math.max(1, Number(rating) || 5)),
    designation: designation || '',
    isActive:    isActive !== 'false' && isActive !== false,
    order:       Number(order) || 0,
  };
  if (req.file) data.profileImage = { url: req.file.path, publicId: req.file.filename };
  const testimonial = await Testimonial.create(data);
  res.status(201).json({ success: true, testimonial });
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, message: 'Not found.' });
  const { name, review, rating, designation, isActive, order } = req.body;
  if (name        !== undefined) testimonial.name        = name;
  if (review      !== undefined) testimonial.review      = review;
  if (rating      !== undefined) testimonial.rating      = Math.min(5, Math.max(1, Number(rating)));
  if (designation !== undefined) testimonial.designation = designation;
  if (isActive    !== undefined) testimonial.isActive    = isActive !== 'false' && isActive !== false;
  if (order       !== undefined) testimonial.order       = Number(order) || 0;
  if (req.file) {
    if (testimonial.profileImage?.publicId) {
      try { const { cloudinary } = require('../config/cloudinary'); await cloudinary.uploader.destroy(testimonial.profileImage.publicId); } catch (_) {}
    }
    testimonial.profileImage = { url: req.file.path, publicId: req.file.filename };
  }
  await testimonial.save();
  res.json({ success: true, testimonial });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.status(404).json({ success: false, message: 'Not found.' });
  if (testimonial.profileImage?.publicId) {
    try { const { cloudinary } = require('../config/cloudinary'); await cloudinary.uploader.destroy(testimonial.profileImage.publicId); } catch (_) {}
  }
  await testimonial.deleteOne();
  res.json({ success: true, message: 'Deleted.' });
});

module.exports = { getTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
