const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const StaticData = require('../models/StaticData');

const router = express.Router();

const DEFAULT_DATA = [
  { category: 'tips', key: 'tip_hydration', title: 'Stay Hydrated', content: 'Drink at least 8 glasses of water daily to support metabolism and muscle recovery.', order: 1 },
  { category: 'tips', key: 'tip_sleep', title: 'Prioritize Sleep', content: 'Aim for 7–9 hours of quality sleep each night. Recovery happens while you rest.', order: 2 },
  { category: 'tips', key: 'tip_consistency', title: 'Consistency Over Perfection', content: 'A consistent moderate effort beats occasional perfect effort every time.', order: 3 },
  { category: 'tips', key: 'tip_protein', title: 'Hit Your Protein Goals', content: 'Aim for 0.8–1g of protein per pound of body weight to support muscle growth and repair.', order: 4 },
  { category: 'announcements', key: 'ann_welcome', title: 'Welcome to FitAI!', content: 'Your AI-powered fitness coach is here. Complete your profile to get a personalized workout and diet plan.', order: 1 },
  { category: 'announcements', key: 'ann_update', title: 'New Feature: Daily Check-ins', content: 'Track your daily energy levels and mood with our new Check-in feature.', order: 2 },
  { category: 'faq', key: 'faq_change_goal', title: 'How do I change my fitness goal?', content: 'You can change your goal anytime from the sidebar. Your workout and diet plans will automatically update.', order: 1 },
  { category: 'faq', key: 'faq_calories', title: 'How are my calorie targets calculated?', content: 'We use the Mifflin-St Jeor equation adjusted for your activity level and goal to calculate your target calories.', order: 2 },
  { category: 'faq', key: 'faq_ai_coach', title: 'What can the AI Coach help with?', content: 'The AI Coach can answer fitness and nutrition questions, help you understand your plan, and provide motivation.', order: 3 },
  { category: 'goal_info', key: 'goal_weight_loss', title: 'Weight Loss', content: 'Focus on a caloric deficit through diet and cardio. Aim for 0.5–1 kg loss per week for sustainable results.', order: 1 },
  { category: 'goal_info', key: 'goal_muscle_gain', title: 'Muscle Gain', content: 'Progressive overload with compound lifts and a caloric surplus. Prioritize protein intake and adequate rest.', order: 2 },
  { category: 'goal_info', key: 'goal_recomposition', title: 'Body Recomposition', content: 'Simultaneously build muscle and lose fat. Requires precise nutrition and a mix of strength and cardio training.', order: 3 },
  { category: 'goal_info', key: 'goal_maintain', title: 'Maintain', content: 'Keep your current physique with a balanced approach to training and nutrition at maintenance calories.', order: 4 },
  { category: 'goal_info', key: 'goal_endurance', title: 'Improve Endurance', content: 'Focus on aerobic capacity with steady-state cardio and HIIT. Build a strong cardiovascular base progressively.', order: 5 },
  { category: 'platform_config', key: 'config_app_name', title: 'App Name', content: 'FitAI', order: 1 },
  { category: 'platform_config', key: 'config_support_email', title: 'Support Email', content: 'support@fitai.app', order: 2 },
  { category: 'platform_config', key: 'config_version', title: 'Platform Version', content: '1.0.0', order: 3 }
];

// Seed default data if collection is empty
const seedDefaultData = async () => {
  const count = await StaticData.countDocuments();
  if (count === 0) {
    await StaticData.insertMany(DEFAULT_DATA);
    console.log('Static data seeded');
  }
};
setTimeout(seedDefaultData, 2000);

// GET /api/admin/static-data?category=tips
router.get('/', adminAuth, async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const items = await StaticData.find(query).sort({ category: 1, order: 1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/static-data
router.post('/', adminAuth, async (req, res) => {
  try {
    const { category, key, title, content, isActive, order } = req.body;
    if (!category || !key || !title || !content) {
      return res.status(400).json({ message: 'category, key, title and content are required' });
    }
    const existing = await StaticData.findOne({ key });
    if (existing) return res.status(409).json({ message: 'Key already exists' });
    const item = await StaticData.create({ category, key, title, content, isActive, order });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/static-data/:id
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, content, isActive, order } = req.body;
    const item = await StaticData.findByIdAndUpdate(
      req.params.id,
      { title, content, isActive, order },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/static-data/:id
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const item = await StaticData.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/static-data/:id/toggle
router.patch('/:id/toggle', adminAuth, async (req, res) => {
  try {
    const item = await StaticData.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.isActive = !item.isActive;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
