const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  waist: Number,
  chest: Number,
  hips: Number,
  arms: Number,
  thighs: Number
});

module.exports = mongoose.model('Measurement', measurementSchema);
