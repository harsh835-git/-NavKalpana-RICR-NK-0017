const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Progress = require('../models/Progress');

router.get('/score', protect, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [weeklyLogs, monthlyLogs] = await Promise.all([
      Progress.find({ user: req.user._id, date: { $gte: sevenDaysAgo } }),
      Progress.find({ user: req.user._id, date: { $gte: thirtyDaysAgo } })
    ]);
    
    const calcScore = (logs) => {
      if (logs.length === 0) return 0;
      const wLogs = logs.filter(l => l.workoutCompletion);
      const dLogs = logs.filter(l => l.dietAdherence);
      
      const wAdh = wLogs.length > 0 ? (
        wLogs.filter(l => l.workoutCompletion === 'completed').length * 100 +
        wLogs.filter(l => l.workoutCompletion === 'partial').length * 50
      ) / wLogs.length : 0;
      
      const dAdh = dLogs.length > 0 ? (
        dLogs.filter(l => l.dietAdherence === 'followed').length * 100 +
        dLogs.filter(l => l.dietAdherence === 'mostly').length * 60
      ) / dLogs.length : 0;
      
      return Math.round((wAdh * 0.60) + (dAdh * 0.40));
    };
    
    res.json({
      weeklyScore: calcScore(weeklyLogs),
      monthlyAverage: calcScore(monthlyLogs)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
