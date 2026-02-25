const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, lowercase: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  profile: {
    age: Number,
    sex: String,
    height: Number,
    currentWeight: Number,
    goalWeight: Number,
    activityLevel: String,
    experienceLevel: String,
    goal: String,
    workoutType: String,
    dietPreference: String,
    bmi: Number,
    maintenanceCalories: Number,
    targetCalories: Number,
    profileComplete: Boolean
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
