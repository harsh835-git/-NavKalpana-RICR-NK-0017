const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: Number,
  workoutCompletion: { type: String, enum: ['completed', 'partial', 'skipped'] },
  dietAdherence: { type: String, enum: ['followed', 'mostly', 'deviated'] },
  notes: String
});

module.exports = mongoose.model('Progress', progressSchema);
