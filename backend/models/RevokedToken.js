const mongoose = require('mongoose');

/**
 * Stores revoked refresh tokens so logout truly invalidates sessions.
 * Documents auto-expire (TTL index) when the token would naturally expire.
 */
const revokedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// MongoDB TTL index — auto-deletes document when expiresAt is reached
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
