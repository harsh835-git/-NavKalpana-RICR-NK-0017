const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const isUsernameMatch = username === process.env.ADMIN_USERNAME;
    const isPasswordMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    if (!isUsernameMatch || !isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username, role: 'admin' });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/auth/verify — verify token validity
router.get('/verify', adminAuth, (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

module.exports = router;
