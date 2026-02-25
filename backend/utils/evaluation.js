/**
 * Weekly automated evaluation engine.
 * Analyses recent progress logs against 4 adjustment triggers and returns
 * structured recommendations + numeric adjustments applied downstream.
 */

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Compute avg weekly weight change from an ordered array of weight log objects.
 * Returns { weeklyWeightChange, dataQuality } where dataQuality is
 * 'insufficient' | 'estimated' | 'reliable'.
 */
const computeWeeklyWeightChange = (weightLogs) => {
  if (weightLogs.length < 2) return { weeklyWeightChange: null, dataQuality: 'insufficient' };

  // Use up to last 6 weight entries for a rolling window
  const span = weightLogs.slice(-6);
  const msElapsed = new Date(span[span.length - 1].date) - new Date(span[0].date);
  const weeksElapsed = msElapsed / MS_PER_WEEK;

  if (weeksElapsed < 1) return { weeklyWeightChange: null, dataQuality: 'insufficient' };

  const weeklyWeightChange = (span[span.length - 1].weight - span[0].weight) / weeksElapsed;
  const dataQuality = weeksElapsed >= 2 && span.length >= 3 ? 'reliable' : 'estimated';
  return { weeklyWeightChange, dataQuality };
};

/**
 * Main evaluation function.
 * @param {Array}  logs    - All Progress documents for the user (sorted oldest→newest)
 * @param {Object} profile - User.profile object
 * @returns {Object}       - Evaluation result
 */
const runWeeklyEvaluation = (logs, profile) => {
  const weightLogs = logs
    .filter(l => l.weight)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const workoutLogs = logs.filter(l => l.workoutCompletion);
  const dietLogs    = logs.filter(l => l.dietAdherence);

  // ── Weight change ───────────────────────────────────────────────────────────
  const { weeklyWeightChange, dataQuality: weightDataQuality } =
    computeWeeklyWeightChange(weightLogs);

  // ── Adherence (last 14 entries of each type) ────────────────────────────────
  const recentWorkout = workoutLogs.slice(-14);
  const recentDiet    = dietLogs.slice(-14);

  const workoutAdherence = recentWorkout.length > 0
    ? Math.round(
        (recentWorkout.filter(l => l.workoutCompletion === 'completed').length * 100 +
         recentWorkout.filter(l => l.workoutCompletion === 'partial').length  *  50) /
        recentWorkout.length
      )
    : null;

  const dietAdherence = recentDiet.length > 0
    ? Math.round(
        (recentDiet.filter(l => l.dietAdherence === 'followed').length * 100 +
         recentDiet.filter(l => l.dietAdherence === 'mostly').length   *  60) /
        recentDiet.length
      )
    : null;

  const overallAdherence =
    workoutAdherence !== null && dietAdherence !== null
      ? Math.round(workoutAdherence * 0.6 + dietAdherence * 0.4)
      : workoutAdherence ?? dietAdherence ?? null;

  const goal = profile?.goal || 'weight_loss';
  const triggers = [];
  let calorieAdjustment = 0;
  let volumeBoost       = false;

  // ── Trigger 1: Weight loss < 0.3 kg/wk → increase deficit ──────────────────
  if (
    (goal === 'weight_loss' || goal === 'recomposition') &&
    weeklyWeightChange !== null &&
    weightDataQuality !== 'insufficient' &&
    weeklyWeightChange > -0.3
  ) {
    calorieAdjustment -= 150;
    triggers.push({
      id:               'slow_loss',
      type:             'increase_deficit',
      severity:         'moderate',
      title:            'Weight Loss Below Target',
      detail:           `Current rate: ${Math.abs(weeklyWeightChange).toFixed(2)} kg/wk — target is 0.3–1.0 kg/wk.`,
      recommendation:   'Daily calorie target reduced by 150 kcal. Trim refined carbs or add 15–20 min of walking to close the gap.',
      calorieAdjustment: -150
    });
  }

  // ── Trigger 2: Weight loss > 1 kg/wk → reduce deficit (safety) ─────────────
  if (weeklyWeightChange !== null && weeklyWeightChange < -1.0) {
    calorieAdjustment += 250;
    triggers.push({
      id:               'fast_loss',
      type:             'reduce_deficit',
      severity:         'high',
      title:            'Weight Loss Too Rapid',
      detail:           `Current rate: ${Math.abs(weeklyWeightChange).toFixed(2)} kg/wk — exceeds the safe 1.0 kg/wk limit.`,
      recommendation:   'Daily calorie target increased by 250 kcal to protect muscle mass and prevent metabolic adaptation.',
      calorieAdjustment: +250
    });
  }

  // ── Trigger 3: Muscle gain stagnant → increase volume ──────────────────────
  if (
    goal === 'muscle_gain' &&
    weeklyWeightChange !== null &&
    weightDataQuality !== 'insufficient' &&
    weeklyWeightChange < 0.1
  ) {
    calorieAdjustment += 150;
    volumeBoost = true;
    triggers.push({
      id:               'stagnant_gain',
      type:             'increase_volume',
      severity:         'moderate',
      title:            'Muscle Gain Stagnant',
      detail:           `Current rate: ${weeklyWeightChange.toFixed(2)} kg/wk — target is 0.1–0.3 kg/wk for lean muscle gain.`,
      recommendation:   'Workout volume increased (+1 set per major compound). Daily calories raised by 150 kcal to support muscle growth.',
      calorieAdjustment: +150
    });
  }

  // ── Trigger 4: Low adherence → simplify plan ───────────────────────────────
  if (overallAdherence !== null && overallAdherence < 60) {
    triggers.push({
      id:               'low_adherence',
      type:             'simplify_plan',
      severity:         'moderate',
      title:            'Low Adherence — Plan Simplified',
      detail:           `Overall adherence is ${overallAdherence}% — below the 60% threshold.`,
      recommendation:   'Workout intensity and meal complexity reduced. Focus on 3 core sessions this week and 2 main meals. Consistency beats perfection.',
      calorieAdjustment: 0
    });
  }

  const status =
    triggers.length === 0                           ? 'on_track'     :
    triggers.some(t => t.severity === 'high')       ? 'critical'     :
    /* otherwise */                                   'adjust_needed';

  return {
    triggers,
    status,
    calorieAdjustment,
    volumeBoost,
    simplifyPlan:        triggers.some(t => t.id === 'low_adherence'),
    weeklyWeightChange:  weeklyWeightChange !== null
                           ? Math.round(weeklyWeightChange * 100) / 100
                           : null,
    weightDataQuality,
    workoutAdherence,
    dietAdherence,
    overallAdherence,
    evaluatedAt:         new Date()
  };
};

module.exports = { runWeeklyEvaluation };
