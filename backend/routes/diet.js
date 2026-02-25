const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateDietPlan } = require('../utils/fitness');
const { runWeeklyEvaluation } = require('../utils/evaluation');
const Progress = require('../models/Progress');

router.get('/plan', protect, async (req, res) => {
  try {
    const { profile } = req.user;
    if (!profile || !profile.profileComplete) {
      return res.status(400).json({ message: 'Please complete your profile first' });
    }

    // Run weekly evaluation to compute any calorie adjustment
    const logs = await Progress.find({ user: req.user._id }).sort({ date: 1 });
    const evaluation = logs.length > 0
      ? runWeeklyEvaluation(logs, profile)
      : null;

    // Apply adjustment only when it's meaningful (not zero)
    const calorieAdj = evaluation?.calorieAdjustment || 0;

    // Safety floor: never go below 1200 kcal (women) / 1500 kcal (men)
    const safetyFloor = profile.sex === 'male' ? 1500 : 1200;
    const adjustedCalories = Math.max(
      safetyFloor,
      (profile.targetCalories || 2000) + calorieAdj
    );

    const plan = generateDietPlan(
      adjustedCalories,
      profile.goal,
      profile.sex,
      profile.dietPreference || 'non_vegetarian'
    );

    res.json({
      ...plan,
      dietPreference: profile.dietPreference || 'non_vegetarian',
      evaluationAdjustment: calorieAdj !== 0 ? {
        applied: calorieAdj,
        originalCalories: profile.targetCalories,
        adjustedCalories,
        triggers: evaluation.triggers.filter(t => t.calorieAdjustment !== 0).map(t => ({
          title: t.title,
          recommendation: t.recommendation
        }))
      } : null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
