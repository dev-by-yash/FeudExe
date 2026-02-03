import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  teams: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    name: String,
    score: {
      type: Number,
      default: 0
    },
    strikes: {
      type: Number,
      default: 0,
      max: 3
    }
  }],
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  questionHistory: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    revealedAnswers: [Number], // indices of revealed answers
    pointsAwarded: [{
      teamId: mongoose.Schema.Types.ObjectId,
      points: Number
    }]
  }],
  gameState: {
    type: String,
    enum: ['waiting', 'active', 'buzzer', 'answering', 'completed'],
    default: 'waiting'
  },
  currentTeamTurn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  timer: {
    duration: {
      type: Number,
      default: 30 // seconds
    },
    startTime: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  settings: {
    teamSize: {
      type: Number,
      default: 4,
      min: 1,
      max: 10
    },
    maxStrikes: {
      type: Number,
      default: 3
    },
    questionTimeLimit: {
      type: Number,
      default: 30
    }
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
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

GameSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Game || mongoose.model('Game', GameSchema);