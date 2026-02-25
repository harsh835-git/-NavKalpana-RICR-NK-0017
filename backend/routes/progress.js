const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { calculateBMI, calculateMaintenanceCalories, calculateTargetCalories } = require('../utils/fitness');
const { runWeeklyEvaluation } = require('../utils/evaluation');

// Log progress
router.post('/log', protect, async (req, res) => {
  try {
    const { weight, workoutCompletion, dietAdherence, notes } = req.body;
    const progress = new Progress({
      user: req.user._id,
      weight,
      workoutCompletion,
      dietAdherence,
      notes
    });
    await progress.save();

    // Recalculate BMI and calorie targets whenever a new weight is recorded
    if (weight && req.user.profile) {
      const { height, age, sex, activityLevel, goal } = req.user.profile;
      if (height && age && sex && activityLevel) {
        const bmi = calculateBMI(weight, height);
        const maintenanceCalories = calculateMaintenanceCalories(weight, height, age, sex, activityLevel);
        const targetCalories = calculateTargetCalories(maintenanceCalories, goal, sex);
        await User.findByIdAndUpdate(req.user._id, {
          'profile.currentWeight': weight,
          'profile.bmi': bmi,
          'profile.maintenanceCalories': maintenanceCalories,
          'profile.targetCalories': targetCalories
        });
      }
    }

    res.status(201).json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all progress
router.get('/', protect, async (req, res) => {
  try {
    const logs = await Progress.find({ user: req.user._id }).sort({ date: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats / analytics
router.get('/stats', protect, async (req, res) => {
  try {
    const logs = await Progress.find({ user: req.user._id }).sort({ date: 1 });
    
    if (logs.length === 0) return res.json({ stats: null });
    
    const workoutLogs = logs.filter(l => l.workoutCompletion);
    const dietLogs = logs.filter(l => l.dietAdherence);
    
    const workoutScore = workoutLogs.length > 0 ? 
      workoutLogs.filter(l => l.workoutCompletion === 'completed').length / workoutLogs.length * 100 : 0;
    const partialScore = workoutLogs.filter(l => l.workoutCompletion === 'partial').length / (workoutLogs.length || 1) * 50;
    const workoutAdherence = Math.round(workoutScore + partialScore * 0.3);
    
    const dietScore = dietLogs.length > 0 ?
      (dietLogs.filter(l => l.dietAdherence === 'followed').length * 100 +
       dietLogs.filter(l => l.dietAdherence === 'mostly').length * 60) / dietLogs.length : 0;
    const dietAdherence = Math.round(dietScore);
    
    const habitScore = Math.round((workoutAdherence * 0.60) + (dietAdherence * 0.40));
    
    // Streak calculation
    let streak = 0;
    const today = new Date();
    for (let i = logs.length - 1; i >= 0; i--) {
      const logDate = new Date(logs[i].date);
      const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
      if (diffDays <= streak + 1) streak++;
      else break;
    }
    
    // Weight trend
    const weightLogs = logs.filter(l => l.weight).map(l => ({ date: l.date, weight: l.weight }));

    // Physiologically realistic weekly change bounds (kg/week)
    // Based on: weight loss 0.25–1.0 kg/wk, muscle gain 0.1–0.5 kg/wk
    const REALISTIC_BOUNDS = {
      weight_loss:    { min: -1.0, max: -0.25, recommended: -0.5 },
      muscle_gain:    { min:  0.1, max:  0.5,  recommended:  0.25 },
      recomposition:  { min: -0.3, max:  0.3,  recommended: -0.2 },
      maintain:       { min: -0.15, max: 0.15, recommended: -0.1 },
      endurance:      { min: -0.5, max:  0.5,  recommended: -0.25 }
    };

    // Goal forecast
    let forecast = null;
    if (weightLogs.length >= 2 && req.user.profile?.goalWeight) {
      const firstWeight = weightLogs[0].weight;
      const lastWeight = weightLogs[weightLogs.length - 1].weight;
      const msElapsed = new Date(weightLogs[weightLogs.length - 1].date) - new Date(weightLogs[0].date);
      const weeksElapsed = msElapsed / (7 * 24 * 60 * 60 * 1000);

      const goal = req.user.profile.goal || 'weight_loss';
      const bounds = REALISTIC_BOUNDS[goal] || REALISTIC_BOUNDS['weight_loss'];

      // Measured rate is only trusted when spread over at least 2 weeks with 3+ logs
      const measuredRate = weeksElapsed >= 2 && weightLogs.length >= 3
        ? (lastWeight - firstWeight) / weeksElapsed
        : null;

      // Clamp the measured rate to physiological bounds; fall back to recommended if unavailable
      let effectiveRate;
      let rateSource;
      if (measuredRate !== null && measuredRate >= bounds.min && measuredRate <= bounds.max) {
        effectiveRate = measuredRate;
        rateSource = 'measured';
      } else if (measuredRate !== null) {
        // Measured rate exists but is outside realistic bounds — clamp it
        effectiveRate = Math.max(bounds.min, Math.min(bounds.max, measuredRate));
        rateSource = 'clamped';
      } else {
        // Not enough data — use the recommended rate for the goal
        effectiveRate = bounds.recommended;
        rateSource = 'estimated';
      }

      const remaining = req.user.profile.goalWeight - lastWeight;

      // Only forecast if moving in the right direction
      if (effectiveRate !== 0 && (remaining < 0 ? effectiveRate < 0 : effectiveRate > 0)) {
        const weeksToGoal = Math.ceil(Math.abs(remaining / effectiveRate));
        const estimatedDate = new Date(Date.now() + weeksToGoal * 7 * 24 * 60 * 60 * 1000);
        forecast = {
          weeksToGoal,
          estimatedDate,
          avgWeeklyChange: Math.round(effectiveRate * 100) / 100,
          currentWeight: lastWeight,
          goalWeight: req.user.profile.goalWeight,
          rateSource
        };
      }
    }
    
    // Drop-off risk
    const recentLogs = logs.filter(l => {
      const daysDiff = (Date.now() - new Date(l.date)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 14;
    });
    
    const consecutiveMissed = workoutLogs.slice(-3).filter(l => l.workoutCompletion === 'skipped').length;
    const noLogDays = recentLogs.length < 3;
    const recentDietLogs = dietLogs.slice(-14);
    const recentDietAdherence = recentDietLogs.filter(l => l.dietAdherence === 'deviated').length / (recentDietLogs.length || 1);
    
    const dropOffRisk = consecutiveMissed >= 3 || noLogDays || recentDietAdherence >= 0.6;
    
    res.json({
      stats: { workoutAdherence, dietAdherence, habitScore, streak, dropOffRisk, consecutiveMissed, noLogDays },
      weightLogs,
      forecast,
      totalLogs: logs.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Weekly automated evaluation
router.get('/evaluation', protect, async (req, res) => {
  try {
    const logs = await Progress.find({ user: req.user._id }).sort({ date: 1 });
    if (logs.length === 0) {
      return res.json({
        evaluation: null,
        message: 'Log at least a few progress entries to receive your first evaluation.'
      });
    }
    const evaluation = runWeeklyEvaluation(logs, req.user.profile);
    res.json({ evaluation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
