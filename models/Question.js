import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answers: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    points: {
      type: Number,
      required: true,
      min: 1
    },
    revealed: {
      type: Boolean,
      default: false
    }
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

QuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Calculate total points
  this.totalPoints = this.answers.reduce((sum, answer) => sum + answer.points, 0);
  next();
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);