const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const {
  calculateMaintenanceCalories,
  calculateTargetCalories,
  calculateBMI,
  generateWorkoutPlan,
  generateDietPlan
} = require('../utils/fitness');

// Get profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Setup / Update profile
router.post('/setup', protect, async (req, res) => {
  try {
    const { age, sex, height, currentWeight, goalWeight, activityLevel, experienceLevel, goal } = req.body;
    
    const bmi = calculateBMI(currentWeight, height);
    const maintenanceCalories = calculateMaintenanceCalories(currentWeight, height, age, sex, activityLevel);
    const targetCalories = calculateTargetCalories(maintenanceCalories, goal, sex);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profile: {
          age, sex, height, currentWeight, goalWeight,
          activityLevel, experienceLevel, goal,
          bmi, maintenanceCalories, targetCalories,
          profileComplete: true
        }
      },
      { new: true }
    );
    
    res.json({ message: 'Profile updated', profile: user.profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update goal only
router.patch('/goal', protect, async (req, res) => {
  try {
    const { goal } = req.body;
    const validGoals = ['weight_loss', 'muscle_gain', 'recomposition', 'maintain', 'endurance'];
    if (!validGoals.includes(goal)) return res.status(400).json({ message: 'Invalid goal' });

    const existing = await User.findById(req.user._id);
    if (!existing?.profile) return res.status(400).json({ message: 'Complete profile setup first' });

    const { maintenanceCalories, sex } = existing.profile;
    const targetCalories = calculateTargetCalories(maintenanceCalories, goal, sex);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.goal': goal, 'profile.targetCalories': targetCalories },
      { new: true }
    ).select('-password');

    res.json({ message: 'Goal updated', profile: user.profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
