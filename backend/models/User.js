const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  profile: {
    age: Number,
    sex: { type: String, enum: ['male', 'female'] },
    height: Number, // cm
    currentWeight: Number, // kg
    goalWeight: Number, // kg
    activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    goal: { type: String, enum: ['weight_loss', 'muscle_gain', 'recomposition', 'maintain', 'endurance'] },
    workoutType: { type: String, enum: ['home', 'gym'], default: 'gym' },
    dietPreference: { type: String, enum: ['vegetarian', 'eggetarian', 'non_vegetarian'], default: 'non_vegetarian' },
    bmi: Number,
    maintenanceCalories: Number,
    targetCalories: Number,
    profileComplete: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
