const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Measurement = require('../models/Measurement');

router.post('/log', protect, async (req, res) => {
  try {
    const { waist, chest, hips, arms, thighs } = req.body;
    const m = new Measurement({ user: req.user._id, waist, chest, hips, arms, thighs });
    await m.save();
    res.status(201).json(m);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const measurements = await Measurement.find({ user: req.user._id }).sort({ date: -1 }).limit(20);
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
