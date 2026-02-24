const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Progress = require('../models/Progress');

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
    
    // Goal forecast
    let forecast = null;
    if (weightLogs.length >= 2) {
      const firstWeight = weightLogs[0].weight;
      const lastWeight = weightLogs[weightLogs.length - 1].weight;
      const weeksElapsed = (new Date(weightLogs[weightLogs.length-1].date) - new Date(weightLogs[0].date)) / (7 * 24 * 60 * 60 * 1000);
      const avgWeeklyChange = weeksElapsed > 0 ? (lastWeight - firstWeight) / weeksElapsed : 0;
      
      if (req.user.profile?.goalWeight && avgWeeklyChange !== 0) {
        const weeksToGoal = Math.abs((req.user.profile.goalWeight - lastWeight) / avgWeeklyChange);
        const estimatedDate = new Date(Date.now() + weeksToGoal * 7 * 24 * 60 * 60 * 1000);
        forecast = {
          weeksToGoal: Math.round(weeksToGoal),
          estimatedDate,
          avgWeeklyChange: Math.round(avgWeeklyChange * 100) / 100,
          currentWeight: lastWeight,
          goalWeight: req.user.profile.goalWeight
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

module.exports = router;
