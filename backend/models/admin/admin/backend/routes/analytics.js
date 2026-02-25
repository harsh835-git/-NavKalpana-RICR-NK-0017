const express = require('express');
const mongoose = require('mongoose');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');

const router = express.Router();

// GET /api/admin/analytics/overview
router.get('/overview', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      profileCompleteUsers,
      totalProgress,
      totalMeasurements,
      totalCheckins,
      totalChats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ 'profile.profileComplete': true }),
      mongoose.connection.db.collection('progresses').countDocuments(),
      mongoose.connection.db.collection('measurements').countDocuments(),
      mongoose.connection.db.collection('checkins').countDocuments(),
      mongoose.connection.db.collection('chats').countDocuments()
    ]);

    res.json({
      totalUsers,
      verifiedUsers,
      profileCompleteUsers,
      totalProgress,
      totalMeasurements,
      totalCheckins,
      totalChats
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/analytics/registrations?days=30
router.get('/registrations', adminAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const users = await User.find({ createdAt: { $gte: since } })
      .select('createdAt')
      .lean();

    const counts = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      counts[d.toISOString().split('T')[0]] = 0;
    }

    users.forEach(u => {
      const key = new Date(u.createdAt).toISOString().split('T')[0];
      if (key in counts) counts[key] = (counts[key] || 0) + 1;
    });

    const labels = Object.keys(counts).map(d => {
      const date = new Date(d);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = Object.values(counts);

    res.json({ labels, data });
  } catch (err) {
    console.error('Registrations analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/analytics/distributions
router.get('/distributions', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ 'profile.profileComplete': true })
      .select('profile.goal profile.activityLevel profile.experienceLevel profile.workoutType profile.dietPreference profile.sex')
      .lean();

    const count = (arr, key) => {
      const map = {};
      arr.forEach(u => {
        const val = u.profile?.[key];
        if (val) map[val] = (map[val] || 0) + 1;
      });
      return map;
    };

    res.json({
      goals: count(users, 'goal'),
      activityLevels: count(users, 'activityLevel'),
      experienceLevels: count(users, 'experienceLevel'),
      workoutTypes: count(users, 'workoutType'),
      dietPreferences: count(users, 'dietPreference'),
      genderSplit: count(users, 'sex')
    });
  } catch (err) {
    console.error('Distributions analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/analytics/bmi-stats
router.get('/bmi-stats', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ 'profile.bmi': { $exists: true, $gt: 0 } })
      .select('profile.bmi')
      .lean();

    const buckets = { Underweight: 0, Normal: 0, Overweight: 0, Obese: 0 };
    users.forEach(u => {
      const bmi = u.profile?.bmi;
      if (!bmi) return;
      if (bmi < 18.5) buckets.Underweight++;
      else if (bmi < 25) buckets.Normal++;
      else if (bmi < 30) buckets.Overweight++;
      else buckets.Obese++;
    });

    res.json(buckets);
  } catch (err) {
    console.error('BMI stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/analytics/recent-activity
router.get('/recent-activity', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email isVerified profile.profileComplete createdAt')
      .lean();

    res.json(users);
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
