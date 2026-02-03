import mongoose from 'mongoose';

/**
 * ActiveGame Model - Simplified game management
 * Stores current active game state for easy Socket.IO integration
 */
const ActiveGameSchema = new mongoose.Schema({
  // Simple game identifier
  gameCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  
  // Teams from buzzer input (not database teams)
  teams: [{
    teamName: {
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
    players: [{
      name: String,
      socketId: String,
      joinedAt: Date
    }]
  }],
  
  // Current question
  currentQuestion: {
    questionId: mongoose.Schema.Types.ObjectId,
    questionText: String,
    answers: [{
      text: String,
      points: Number,
      revealed: {
        type: Boolean,
        default: false
      }
    }],
    questionIndex: {
      type: Number,
      default: 0
    }
  },
  
  // Game state
  gameState: {
    type: String,
    enum: ['waiting', 'active', 'buzzer-ready', 'buzzer-locked', 'completed'],
    default: 'waiting'
  },
  
  // Current round and progress
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
  
  // Buzzer state
  buzzerState: {
    enabled: {
      type: Boolean,
      default: false
    },
    winner: {
      teamName: String,
      playerName: String,
      timestamp: Date
    }
  },
  
  // Scoring
  scoring: {
    currentTeam: {
      type: String,
      default: null
    },
    streakCount: {
      type: Number,
      default: 0
    },
    streakTeam: {
      type: String,
      default: null
    }
  },
  
  // Connected clients
  connectedClients: [{
    socketId: String,
    role: {
      type: String,
      enum: ['host', 'buzzer', 'display']
    },
    teamName: String,
    connectedAt: Date
  }],
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date
}, {
  timestamps: true
});

// Update lastActivity on any change
ActiveGameSchema.pre('save', function(next) {
  this.lastActivity = Date.now();
  next();
});

// Helper methods
ActiveGameSchema.methods.addTeam = function(teamName) {
  // Check if team already exists
  const existingTeam = this.teams.find(t => t.teamName === teamName);
  if (existingTeam) {
    console.log(`Team "${teamName}" already exists, skipping`);
    return existingTeam;
  }
  
  if (this.teams.length >= 2) {
    throw new Error('Maximum 2 teams allowed');
  }
  
  this.teams.push({
    teamName,
    score: 0,
    strikes: 0,
    players: []
  });
  
  return this.teams[this.teams.length - 1];
};

ActiveGameSchema.methods.addPlayer = function(teamName, playerName, socketId) {
  const team = this.teams.find(t => t.teamName === teamName);
  if (!team) {
    throw new Error('Team not found');
  }
  
  team.players.push({
    name: playerName,
    socketId,
    joinedAt: new Date()
  });
  
  return team;
};

ActiveGameSchema.methods.updateScore = function(teamName, points) {
  const team = this.teams.find(t => t.teamName === teamName);
  if (!team) {
    throw new Error('Team not found');
  }
  
  team.score += points;
  return team.score;
};

ActiveGameSchema.methods.addStrike = function(teamName) {
  const team = this.teams.find(t => t.teamName === teamName);
  if (!team) {
    throw new Error('Team not found');
  }
  
  team.strikes = Math.min(team.strikes + 1, 3);
  return team.strikes;
};

ActiveGameSchema.methods.resetStrikes = function() {
  this.teams.forEach(team => {
    team.strikes = 0;
  });
};

ActiveGameSchema.methods.revealAnswer = function(answerIndex) {
  if (this.currentQuestion && this.currentQuestion.answers[answerIndex]) {
    this.currentQuestion.answers[answerIndex].revealed = true;
    return this.currentQuestion.answers[answerIndex];
  }
  return null;
};

ActiveGameSchema.methods.enableBuzzer = function() {
  this.buzzerState.enabled = true;
  this.gameState = 'buzzer-ready';
};

ActiveGameSchema.methods.disableBuzzer = function() {
  this.buzzerState.enabled = false;
  this.buzzerState.winner = null;
  if (this.gameState === 'buzzer-ready' || this.gameState === 'buzzer-locked') {
    this.gameState = 'active';
  }
};

ActiveGameSchema.methods.setBuzzerWinner = function(teamName, playerName) {
  this.buzzerState.winner = {
    teamName,
    playerName,
    timestamp: new Date()
  };
  this.buzzerState.enabled = false;
  this.gameState = 'buzzer-locked';
  this.scoring.currentTeam = teamName;
};

ActiveGameSchema.methods.addClient = function(socketId, role, teamName = null) {
  // Remove existing client with same socketId
  this.connectedClients = this.connectedClients.filter(c => c.socketId !== socketId);
  
  this.connectedClients.push({
    socketId,
    role,
    teamName,
    connectedAt: new Date()
  });
};

ActiveGameSchema.methods.removeClient = function(socketId) {
  this.connectedClients = this.connectedClients.filter(c => c.socketId !== socketId);
};

ActiveGameSchema.methods.getGameState = function() {
  return {
    gameCode: this.gameCode,
    teams: this.teams.map(t => ({
      teamName: t.teamName,
      score: t.score,
      strikes: t.strikes,
      playerCount: t.players.length
    })),
    currentQuestion: this.currentQuestion,
    gameState: this.gameState,
    currentRound: this.currentRound,
    currentQuestionIndex: this.currentQuestionIndex,
    buzzerState: this.buzzerState,
    scoring: this.scoring,
    connectedClients: this.connectedClients.length
  };
};

// Static method to find or create game by code
ActiveGameSchema.statics.findOrCreateByCode = async function(gameCode) {
  let game = await this.findOne({ gameCode: gameCode.toUpperCase() });
  
  if (!game) {
    game = new this({
      gameCode: gameCode.toUpperCase(),
      teams: [],
      gameState: 'waiting'
    });
    await game.save();
  }
  
  return game;
};

// Static method to cleanup old games
ActiveGameSchema.statics.cleanupOldGames = async function(hoursOld = 24) {
  const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
  return await this.deleteMany({
    lastActivity: { $lt: cutoffDate }
  });
};

export default mongoose.models.ActiveGame || mongoose.model('ActiveGame', ActiveGameSchema);
