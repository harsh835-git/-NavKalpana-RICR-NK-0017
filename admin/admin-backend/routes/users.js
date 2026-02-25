const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');

const router = express.Router();

// GET /api/admin/users?page=1&limit=20&search=&filter=all
router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const filter = req.query.filter || 'all';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (filter === 'verified') query.isVerified = true;
    else if (filter === 'unverified') query.isVerified = false;
    else if (filter === 'profile_complete') query['profile.profileComplete'] = true;
    else if (filter === 'profile_incomplete') query['profile.profileComplete'] = { $ne: true };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Users list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('User detail error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('User delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/verify — toggle email verification
router.patch('/:id/verify', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isVerified = !user.isVerified;
    await user.save();
    res.json({ message: `User ${user.isVerified ? 'verified' : 'unverified'}`, isVerified: user.isVerified });
  } catch (err) {
    console.error('User verify toggle error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users/:id/stats — user-specific stats
router.get('/:id/stats', adminAuth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = new mongoose.Types.ObjectId(req.params.id);

    const [progressCount, measurementCount, checkinCount, chatCount] = await Promise.all([
      mongoose.connection.db.collection('progresses').countDocuments({ user: userId }),
      mongoose.connection.db.collection('measurements').countDocuments({ user: userId }),
      mongoose.connection.db.collection('checkins').countDocuments({ user: userId }),
      mongoose.connection.db.collection('chats').countDocuments({ user: userId })
    ]);

    res.json({ progressCount, measurementCount, checkinCount, chatCount });
  } catch (err) {
    console.error('User stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
