import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  teamSize: {
    type: Number,
    default: 4,
    min: 1,
    max: 10
  },
  maxStrikes: {
    type: Number,
    default: 3,
    min: 1,
    max: 5
  },
  questionTimeLimit: {
    type: Number,
    default: 30, // seconds
    min: 10,
    max: 120
  },
  buzzerTimeLimit: {
    type: Number,
    default: 5, // seconds
    min: 3,
    max: 10
  },
  pointsToWin: {
    type: Number,
    default: 300,
    min: 100,
    max: 1000
  },
  categories: [{
    name: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

SettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);