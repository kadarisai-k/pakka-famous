const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Helper: get a single setting by key
settingsSchema.statics.getValue = async function (key, defaultValue) {
  const doc = await this.findOne({ key });
  return doc ? doc.value : defaultValue;
};

// Helper: set a single setting by key
settingsSchema.statics.setValue = async function (key, value) {
  return this.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('Settings', settingsSchema);
