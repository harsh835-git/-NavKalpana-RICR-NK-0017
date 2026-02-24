const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CheckIn = require('../models/CheckIn');

router.post('/', protect, async (req, res) => {
  try {
    const { energyLevel } = req.body;
    const c = new CheckIn({ user: req.user._id, energyLevel });
    await c.save();
    
    // Check for fatigue pattern
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCheckins = await CheckIn.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    });
    
    const fatigueCount = recentCheckins.filter(c => 
      c.energyLevel === 'slightly_fatigued' || c.energyLevel === 'very_tired'
    ).length;
    
    const recommendation = fatigueCount >= 3 
      ? { type: 'recovery', message: 'You\'ve had 3+ fatigue flags this week. A recovery day is recommended.' }
      : energyLevel === 'very_tired' 
        ? { type: 'reduce', message: 'Consider reducing intensity or swapping to mobility work today.' }
        : null;
    
    res.status(201).json({ checkin: c, recommendation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const checkins = await CheckIn.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
