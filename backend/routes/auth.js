const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendOTP, sendPasswordResetEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const otp = generateOTP();
    const user = new User({
      name,
      email,
      password,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
    });
    
    await user.save();
    await sendOTP(email, otp, name);
    
    res.status(201).json({ message: 'OTP sent to email', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'OTP expired' });
    
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, profileComplete: user.profile?.profileComplete } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTP(user.email, otp, user.name);
    
    res.json({ message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email first' });
    
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profileComplete: user.profile?.profileComplete 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email address' });
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email before resetting your password' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendPasswordResetEmail(user.email, user.name, resetLink);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
