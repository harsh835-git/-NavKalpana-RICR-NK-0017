const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateDietPlan } = require('../utils/fitness');

router.get('/plan', protect, async (req, res) => {
  try {
    const { profile } = req.user;
    if (!profile || !profile.profileComplete) {
      return res.status(400).json({ message: 'Please complete your profile first' });
    }
    const plan = generateDietPlan(profile.targetCalories, profile.goal, profile.sex);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
