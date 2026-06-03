const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type:      String,
    required:  [true, 'Name is required'],
    trim:      true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type:     String,
    required: [true, 'Email is required'],
    unique:   true,
    lowercase: true,
    trim:     true,
    match:    [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
  },
  phone: {
    type:     String,
    required: [true, 'Phone number is required'],
    match:    [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select:    false,
  },
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },

  // ── Brute-force lockout ──────────────────────────────────────────
  loginAttempts: { type: Number, default: 0, select: false },
  lockUntil:     { type: Date,              select: false },
}, { timestamps: true });

// ── Indexes ────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ── Virtual: is account currently locked? ─────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Hash password before save ──────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare password ───────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
