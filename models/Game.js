import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  teams: [{
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    strikes: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    }
  }],
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    revealedAnswers: [{
      type: Boolean,
      default: false
    }],
    completedAt: Date
  }],
  currentRound: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  currentTeamTurn: {
    type: String,
    enum: ['A', 'B'],
    default: 'A'
  },
  gameState: {
    type: String,
    enum: ['setup', 'active', 'buzzer', 'answering', 'steal', 'completed', 'paused'],
    default: 'setup'
  },
  settings: {
    teamSize: {
      type: Number,
      default: 4
    },
    maxStrikes: {
      type: Number,
      default: 3
    },
    questionTimeLimit: {
      type: Number,
      default: 30
    },
    buzzerTimeLimit: {
      type: Number,
      default: 5
    }
  },
  scoring: {
    streakCount: {
      type: Number,
      default: 0
    },
    streakTeam: {
      type: String,
      enum: ['A', 'B', null],
      default: null
    },
    buzzerBonus: {
      type: Boolean,
      default: false
    },
    stealAttemptUsed: {
      type: Boolean,
      default: false
    },
    roundMultipliers: {
      type: Map,
      of: Number,
      default: { 1: 1, 2: 2, 3: 3 }
    }
  },
  statistics: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    questionsCompleted: {
      type: Number,
      default: 0
    },
    totalAnswersRevealed: {
      type: Number,
      default: 0
    },
    stealsAttempted: {
      type: Number,
      default: 0
    },
    stealsSuccessful: {
      type: Number,
      default: 0
    },
    perfectBoards: {
      type: Number,
      default: 0
    }
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
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

// Calculate game duration
GameSchema.virtual('duration').get(function() {
  if (this.completedAt && this.startedAt) {
    return Math.round((this.completedAt - this.startedAt) / 1000); // in seconds
  }
  return null;
});

// Calculate completion percentage
GameSchema.virtual('completionPercentage').get(function() {
  if (this.statistics.totalQuestions > 0) {
    return Math.round((this.statistics.questionsCompleted / this.statistics.totalQuestions) * 100);
  }
  return 0;
});

// Get current question
GameSchema.methods.getCurrentQuestion = function() {
  if (this.questions && this.currentQuestionIndex < this.questions.length) {
    return this.questions[this.currentQuestionIndex];
  }
  return null;
};

// Get team by ID
GameSchema.methods.getTeamById = function(teamId) {
  return this.teams.find(team => team.teamId.toString() === teamId.toString());
};

// Get team by letter (A or B)
GameSchema.methods.getTeamByLetter = function(letter) {
  const index = letter === 'A' ? 0 : 1;
  return this.teams[index];
};

// Update team score
GameSchema.methods.updateTeamScore = function(teamLetter, scoreToAdd) {
  const team = this.getTeamByLetter(teamLetter);
  if (team) {
    team.score += scoreToAdd;
    return team.score;
  }
  return 0;
};

// Add strike to team
GameSchema.methods.addStrike = function(teamLetter) {
  const team = this.getTeamByLetter(teamLetter);
  if (team) {
    team.strikes = Math.min(team.strikes + 1, this.settings.maxStrikes);
    return team.strikes;
  }
  return 0;
};

// Reset strikes for all teams
GameSchema.methods.resetStrikes = function() {
  this.teams.forEach(team => {
    team.strikes = 0;
  });
};

// Switch team turn
GameSchema.methods.switchTeamTurn = function() {
  this.currentTeamTurn = this.currentTeamTurn === 'A' ? 'B' : 'A';
  return this.currentTeamTurn;
};

// Move to next question
GameSchema.methods.nextQuestion = function() {
  this.currentQuestionIndex++;
  this.resetStrikes();
  this.scoring.streakCount = 0;
  this.scoring.streakTeam = null;
  this.scoring.buzzerBonus = false;
  this.scoring.stealAttemptUsed = false;
  
  // Check if we need to move to next round
  const questionsPerRound = Math.ceil(this.questions.length / 3);
  const newRound = Math.ceil((this.currentQuestionIndex + 1) / questionsPerRound);
  
  if (newRound !== this.currentRound && newRound <= 3) {
    this.currentRound = newRound;
  }
  
  // Check if game is completed
  if (this.currentQuestionIndex >= this.questions.length) {
    this.gameState = 'completed';
    this.completedAt = new Date();
    this.statistics.questionsCompleted = this.questions.length;
  }
  
  return {
    questionIndex: this.currentQuestionIndex,
    round: this.currentRound,
    completed: this.gameState === 'completed'
  };
};

// Get game summary
GameSchema.methods.getSummary = function() {
  return {
    id: this._id,
    teams: this.teams.map(team => ({
      name: team.name,
      score: team.score,
      strikes: team.strikes
    })),
    currentRound: this.currentRound,
    currentQuestion: this.currentQuestionIndex + 1,
    totalQuestions: this.questions.length,
    gameState: this.gameState,
    duration: this.duration,
    completionPercentage: this.completionPercentage,
    statistics: this.statistics
  };
};

export default mongoose.models.Game || mongoose.model('Game', GameSchema);