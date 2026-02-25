const mongoose = require('mongoose');

const staticDataSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['tips', 'announcements', 'faq', 'goal_info', 'platform_config']
  },
  key: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

staticDataSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

staticDataSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.models.StaticData || mongoose.model('StaticData', staticDataSchema);
