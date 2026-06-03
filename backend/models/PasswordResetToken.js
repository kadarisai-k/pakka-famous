const mongoose = require('mongoose');
const crypto   = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  // Store hashed token — never store raw token in DB (same principle as passwords)
  tokenHash: {
    type:     String,
    required: true,
  },
  expiresAt: {
    type:     Date,
    required: true,
    default:  () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes only
  },
  used: {
    type:    Boolean,
    default: false,
  },
});

// MongoDB TTL — auto-delete expired tokens after 1 hour
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
passwordResetTokenSchema.index({ userId: 1 });

// Static: generate a raw token, return it AND the hash to store
passwordResetTokenSchema.statics.createToken = async function (userId) {
  // Delete any existing tokens for this user first
  await this.deleteMany({ userId });

  const rawToken  = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  await this.create({ userId, tokenHash });
  return rawToken; // returned to user via email — never stored raw
};

// Static: verify a submitted token
passwordResetTokenSchema.statics.verifyToken = async function (rawToken) {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const record    = await this.findOne({ tokenHash, used: false });

  if (!record)                          return { valid: false, reason: 'Token not found or already used' };
  if (record.expiresAt < new Date())    return { valid: false, reason: 'Token has expired' };

  return { valid: true, record };
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
