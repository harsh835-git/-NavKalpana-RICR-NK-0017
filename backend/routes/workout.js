const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateWorkoutPlan } = require('../utils/fitness');
const Progress = require('../models/Progress');

// Get workout plan
router.get('/plan', protect, async (req, res) => {
  try {
    const { profile } = req.user;
    if (!profile || !profile.profileComplete) {
      return res.status(400).json({ message: 'Please complete your profile first' });
    }
    
    // Check if needs progressive overload adjustment
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentLogs = await Progress.find({
      user: req.user._id,
      date: { $gte: twoWeeksAgo },
      workoutCompletion: { $exists: true }
    });
    
    let adjustedExperience = profile.experienceLevel;
    if (recentLogs.length >= 10) {
      const completedCount = recentLogs.filter(l => l.workoutCompletion === 'completed').length;
      const completionRate = completedCount / recentLogs.length;
      if (completionRate >= 0.9 && profile.experienceLevel === 'beginner') {
        adjustedExperience = 'intermediate';
      } else if (completionRate < 0.5) {
        adjustedExperience = 'beginner';
      }
    }
    
    const plan = generateWorkoutPlan(profile.goal, adjustedExperience, profile.activityLevel);
    res.json({ plan, adjustedExperience });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
