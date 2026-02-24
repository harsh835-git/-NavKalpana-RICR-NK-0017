const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  energyLevel: { type: String, enum: ['energized', 'normal', 'slightly_fatigued', 'very_tired'] }
});

module.exports = mongoose.model('CheckIn', checkinSchema);
