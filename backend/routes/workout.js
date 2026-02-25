const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateWorkoutPlan } = require('../utils/fitness');
const { runWeeklyEvaluation } = require('../utils/evaluation');
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
    let adjustmentSummary = null;

    // Run weekly evaluation to get volume boost and simplify flags
    const allLogs = await Progress.find({ user: req.user._id }).sort({ date: 1 });
    const evaluation = allLogs.length > 0
      ? runWeeklyEvaluation(allLogs, profile)
      : null;

    const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
    const LEVEL_UP    = ['beginner', 'intermediate', 'advanced'];

    if (recentLogs.length >= 10) {
      const completedCount = recentLogs.filter(l => l.workoutCompletion === 'completed').length;
      const completionRate = completedCount / recentLogs.length;
      const completionPct = Math.round(completionRate * 100);

      if (completionRate >= 0.9 && profile.experienceLevel === 'beginner') {
        adjustedExperience = 'intermediate';
        adjustmentSummary = {
          type: 'upgrade',
          from: 'beginner',
          to: 'intermediate',
          completionRate: completionPct,
          reason: `Your completion rate over the last 2 weeks is ${completionPct}% — excellent consistency.`,
          impact: 'Sets, reps, and exercise difficulty have been increased to match your improved fitness level.',
          action: 'Keep up the consistency to continue progressing.'
        };
      } else if (completionRate < 0.5 || evaluation?.simplifyPlan) {
        const fromLevel = profile.experienceLevel;
        adjustedExperience = 'beginner';
        if (fromLevel !== 'beginner') {
          const reason = evaluation?.simplifyPlan
            ? `Overall adherence is ${evaluation.overallAdherence}% and completion rate is ${completionPct}%.`
            : `Workout completion rate over the last 2 weeks is ${completionPct}% — below the 50% threshold.`;
          adjustmentSummary = {
            type: 'downgrade',
            from: fromLevel,
            to: 'beginner',
            completionRate: completionPct,
            reason,
            impact: 'Plan intensity reduced: fewer sets, lighter loads, and more recovery time to rebuild consistency.',
            action: 'Focus on showing up every day. A lighter plan done consistently outperforms a heavy plan abandoned.'
          };
        }
      }
    }

    // Volume boost for stagnant muscle gain — bump one tier up if evaluation recommends it
    if (evaluation?.volumeBoost && !adjustmentSummary) {
      const currentIdx = LEVEL_ORDER[adjustedExperience] ?? 0;
      const boostedLevel = LEVEL_UP[Math.min(currentIdx + 1, 2)];
      if (boostedLevel !== adjustedExperience) {
        adjustedExperience = boostedLevel;
        adjustmentSummary = {
          type: 'volume_boost',
          from: profile.experienceLevel,
          to: boostedLevel,
          completionRate: null,
          reason: `Muscle gain is below the 0.1 kg/wk target — weekly evaluation triggered a volume increase.`,
          impact: 'More sets and higher intensity added to stimulate muscle growth.',
          action: 'Ensure you are eating enough protein (1.6–2.2 g/kg body weight) and getting 7–9 hours of sleep.'
        };
      }
    }

    const plan = generateWorkoutPlan(profile.goal, adjustedExperience, profile.activityLevel, profile.workoutType || 'gym');
    res.json({ plan, adjustedExperience, workoutType: profile.workoutType || 'gym', adjustmentSummary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
