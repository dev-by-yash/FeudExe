/**
 * FEUD.EXE Advanced Scoring System
 * Handles all scoring mechanics including multipliers, bonuses, streaks, and steals
 */

export class ScoringEngine {
  constructor() {
    this.gameState = {
      teams: {
        A: { score: 0, strikes: 0, name: 'Team A' },
        B: { score: 0, strikes: 0, name: 'Team B' }
      },
      currentRound: 1,
      currentTeam: 'A',
      streakCount: 0,
      streakTeam: null,
      buzzerBonus: false,
      revealedAnswers: [],
      questionActive: false,
      stealAttemptUsed: false
    };
    
    this.roundMultipliers = {
      1: 1,
      2: 2,
      3: 3
    };
    
    this.streakMultipliers = {
      1: 1,
      2: 10,
      3: 20,
      4: 30,
      5: 40,
      6: 50
    };
    
    this.bonuses = {
      buzzer: 10,
      steal: 20,
      perfectBoard: 50
    };
  }

  /**
   * Initialize a new question
   */
  startNewQuestion(answers, currentTeam = 'A') {
    this.gameState.currentTeam = currentTeam;
    this.gameState.teams.A.strikes = 0;
    this.gameState.teams.B.strikes = 0;
    this.gameState.streakCount = 0;
    this.gameState.streakTeam = null;
    this.gameState.buzzerBonus = false;
    this.gameState.revealedAnswers = answers.map(() => false);
    this.gameState.questionActive = true;
    this.gameState.stealAttemptUsed = false;
    
    console.log(`🎯 New question started - Round ${this.gameState.currentRound}`);
    return this.getGameState();
  }

  /**
   * Handle buzzer press - awards buzzer bonus to first correct answer
   */
  handleBuzzer(teamId) {
    if (!this.gameState.questionActive) return null;
    
    this.gameState.currentTeam = teamId;
    this.gameState.buzzerBonus = true;
    
    console.log(`🔔 ${this.getTeamName(teamId)} buzzed in!`);
    return this.getGameState();
  }

  /**
   * Process a correct answer
   */
  processCorrectAnswer(answerIndex, answerPoints, teamId = null) {
    if (!this.gameState.questionActive) {
      return { success: false, message: 'Question not active' };
    }

    const team = teamId || this.gameState.currentTeam;
    
    // Check if answer already revealed
    if (this.gameState.revealedAnswers[answerIndex]) {
      return { success: false, message: 'Answer already revealed' };
    }

    // Mark answer as revealed
    this.gameState.revealedAnswers[answerIndex] = true;

    // Calculate score with all multipliers and bonuses
    const scoreCalculation = this.calculateScore(answerPoints, team, answerIndex);
    
    // Add score to team
    this.gameState.teams[team].score += scoreCalculation.totalScore;
    
    // Update streak
    this.updateStreak(team);
    
    // Remove buzzer bonus after first use
    if (this.gameState.buzzerBonus) {
      this.gameState.buzzerBonus = false;
    }

    // Check for perfect board bonus
    const perfectBoardBonus = this.checkPerfectBoard(team);
    if (perfectBoardBonus > 0) {
      this.gameState.teams[team].score += perfectBoardBonus;
      scoreCalculation.perfectBoardBonus = perfectBoardBonus;
      scoreCalculation.totalScore += perfectBoardBonus;
    }

    console.log(`✅ ${this.getTeamName(team)} scored ${scoreCalculation.totalScore} points!`);
    
    return {
      success: true,
      team,
      scoreCalculation,
      gameState: this.getGameState()
    };
  }

  /**
   * Process a wrong answer (adds strike)
   */
  processWrongAnswer(teamId = null) {
    if (!this.gameState.questionActive) {
      return { success: false, message: 'Question not active' };
    }

    const team = teamId || this.gameState.currentTeam;
    
    // Add strike
    this.gameState.teams[team].strikes++;
    
    // Reset streak
    this.resetStreak();
    
    // Remove buzzer bonus
    this.gameState.buzzerBonus = false;

    console.log(`❌ ${this.getTeamName(team)} got a strike! (${this.gameState.teams[team].strikes}/3)`);

    // Check if team has 3 strikes
    if (this.gameState.teams[team].strikes >= 3) {
      const otherTeam = team === 'A' ? 'B' : 'A';
      this.gameState.currentTeam = otherTeam;
      
      console.log(`🔄 Control passes to ${this.getTeamName(otherTeam)} for steal attempt!`);
      
      return {
        success: true,
        strikes: this.gameState.teams[team].strikes,
        controlSwitch: true,
        stealOpportunity: true,
        gameState: this.getGameState()
      };
    }

    return {
      success: true,
      strikes: this.gameState.teams[team].strikes,
      gameState: this.getGameState()
    };
  }

  /**
   * Process steal attempt
   */
  processStealAttempt(isCorrect, answerIndex = null, answerPoints = 0) {
    if (!this.gameState.questionActive || this.gameState.stealAttemptUsed) {
      return { success: false, message: 'Steal attempt not available' };
    }

    const stealingTeam = this.gameState.currentTeam;
    this.gameState.stealAttemptUsed = true;

    if (isCorrect && answerIndex !== null) {
      // Mark answer as revealed
      this.gameState.revealedAnswers[answerIndex] = true;

      // Calculate all remaining unrevealed points
      const remainingPoints = this.calculateRemainingPoints();
      
      // Calculate steal score (remaining points + steal bonus + round multiplier)
      const roundMultiplier = this.roundMultipliers[this.gameState.currentRound];
      const stealBonus = this.bonuses.steal;
      const totalStealScore = (remainingPoints + stealBonus) * roundMultiplier;

      // Award points to stealing team
      this.gameState.teams[stealingTeam].score += totalStealScore;

      console.log(`🎯 SUCCESSFUL STEAL! ${this.getTeamName(stealingTeam)} steals ${totalStealScore} points!`);

      // End question
      this.endQuestion();

      return {
        success: true,
        stealSuccessful: true,
        stealScore: totalStealScore,
        remainingPoints,
        stealBonus,
        roundMultiplier,
        gameState: this.getGameState()
      };
    } else {
      console.log(`❌ ${this.getTeamName(stealingTeam)} failed the steal attempt!`);
      
      // End question
      this.endQuestion();

      return {
        success: true,
        stealSuccessful: false,
        gameState: this.getGameState()
      };
    }
  }

  /**
   * Calculate score with all multipliers and bonuses
   */
  calculateScore(basePoints, team, answerIndex) {
    const calculation = {
      basePoints,
      roundMultiplier: this.roundMultipliers[this.gameState.currentRound],
      streakMultiplier: this.getStreakMultiplier(team),
      buzzerBonus: this.gameState.buzzerBonus ? this.bonuses.buzzer : 0,
      stealBonus: 0,
      perfectBoardBonus: 0,
      totalScore: 0
    };

    // Step 1: Apply round multiplier to base points
    let score = basePoints * calculation.roundMultiplier;

    // Step 2: Apply streak multiplier
    score = score * calculation.streakMultiplier;

    // Step 3: Add buzzer bonus (applied after multipliers)
    if (calculation.buzzerBonus > 0) {
      score += calculation.buzzerBonus * calculation.roundMultiplier;
    }

    calculation.totalScore = Math.floor(score);

    console.log(`📊 Score calculation for ${this.getTeamName(team)}:`, calculation);

    return calculation;
  }

  /**
   * Calculate remaining unrevealed points for steal
   */
  calculateRemainingPoints() {
    // This would need to be passed the current question's answers
    // For now, return a placeholder - this should be called with actual answer data
    return 0;
  }

  /**
   * Calculate remaining points from actual answers array
   */
  calculateRemainingPointsFromAnswers(answers) {
    let remainingPoints = 0;
    
    for (let i = 0; i < answers.length; i++) {
      if (!this.gameState.revealedAnswers[i] && answers[i]) {
        remainingPoints += answers[i].points;
      }
    }
    
    return remainingPoints;
  }

  /**
   * Update streak system
   */
  updateStreak(team) {
    if (this.gameState.streakTeam === team) {
      this.gameState.streakCount = Math.min(this.gameState.streakCount + 1, 6);
    } else {
      this.gameState.streakTeam = team;
      this.gameState.streakCount = 1;
    }

    console.log(`🔥 ${this.getTeamName(team)} streak: ${this.gameState.streakCount}`);
  }

  /**
   * Reset streak
   */
  resetStreak() {
    this.gameState.streakCount = 0;
    this.gameState.streakTeam = null;
    console.log('🔄 Streak reset');
  }

  /**
   * Get streak multiplier for team
   */
  getStreakMultiplier(team) {
    if (this.gameState.streakTeam === team && this.gameState.streakCount > 0) {
      return this.streakMultipliers[this.gameState.streakCount] || 1;
    }
    return 1;
  }

  /**
   * Check for perfect board bonus
   */
  checkPerfectBoard(team) {
    const allRevealed = this.gameState.revealedAnswers.every(revealed => revealed);
    
    if (allRevealed && !this.gameState.stealAttemptUsed) {
      const roundMultiplier = this.roundMultipliers[this.gameState.currentRound];
      const bonus = this.bonuses.perfectBoard * roundMultiplier;
      
      console.log(`🎊 PERFECT BOARD! ${this.getTeamName(team)} gets ${bonus} bonus points!`);
      return bonus;
    }
    
    return 0;
  }

  /**
   * End current question
   */
  endQuestion() {
    this.gameState.questionActive = false;
    this.resetStreak();
    console.log('🏁 Question ended');
  }

  /**
   * Start new round
   */
  startNewRound(roundNumber) {
    if (roundNumber >= 1 && roundNumber <= 3) {
      this.gameState.currentRound = roundNumber;
      this.resetStreak();
      console.log(`🎮 Round ${roundNumber} started! (×${this.roundMultipliers[roundNumber]} multiplier)`);
    }
    return this.getGameState();
  }

  /**
   * Switch control to other team
   */
  switchControl() {
    this.gameState.currentTeam = this.gameState.currentTeam === 'A' ? 'B' : 'A';
    this.resetStreak();
    return this.getGameState();
  }

  /**
   * Set team names
   */
  setTeamNames(teamAName, teamBName) {
    this.gameState.teams.A.name = teamAName;
    this.gameState.teams.B.name = teamBName;
  }

  /**
   * Get team name
   */
  getTeamName(teamId) {
    return this.gameState.teams[teamId]?.name || `Team ${teamId}`;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return {
      ...this.gameState,
      roundMultiplier: this.roundMultipliers[this.gameState.currentRound],
      streakMultiplier: this.getStreakMultiplier(this.gameState.currentTeam),
      canSteal: this.gameState.teams[this.gameState.currentTeam].strikes >= 3 && !this.gameState.stealAttemptUsed
    };
  }

  /**
   * Reset game
   */
  resetGame() {
    this.gameState = {
      teams: {
        A: { score: 0, strikes: 0, name: 'Team A' },
        B: { score: 0, strikes: 0, name: 'Team B' }
      },
      currentRound: 1,
      currentTeam: 'A',
      streakCount: 0,
      streakTeam: null,
      buzzerBonus: false,
      revealedAnswers: [],
      questionActive: false,
      stealAttemptUsed: false
    };
    
    console.log('🔄 Game reset');
    return this.getGameState();
  }

  /**
   * Get scoring summary for display
   */
  getScoringSummary() {
    return {
      teams: this.gameState.teams,
      round: this.gameState.currentRound,
      roundMultiplier: this.roundMultipliers[this.gameState.currentRound],
      currentTeam: this.gameState.currentTeam,
      streak: {
        team: this.gameState.streakTeam,
        count: this.gameState.streakCount,
        multiplier: this.getStreakMultiplier(this.gameState.streakTeam)
      },
      bonuses: this.bonuses,
      questionActive: this.gameState.questionActive
    };
  }
}

// Export singleton instance
export const scoringEngine = new ScoringEngine();

// Helper functions for easy integration
export const scoringHelpers = {
  /**
   * Process answer reveal from host controls
   */
  processAnswerReveal: (answerIndex, answer, isCorrect, teamId) => {
    if (isCorrect) {
      return scoringEngine.processCorrectAnswer(answerIndex, answer.points, teamId);
    } else {
      return scoringEngine.processWrongAnswer(teamId);
    }
  },

  /**
   * Handle buzzer press with team info
   */
  handleBuzzerPress: (teamId, teamName) => {
    if (teamName) {
      scoringEngine.setTeamNames(
        teamId === 'A' ? teamName : scoringEngine.getTeamName('A'),
        teamId === 'B' ? teamName : scoringEngine.getTeamName('B')
      );
    }
    return scoringEngine.handleBuzzer(teamId);
  },

  /**
   * Start question with answer data
   */
  startQuestion: (answers, startingTeam = 'A') => {
    return scoringEngine.startNewQuestion(answers, startingTeam);
  },

  /**
   * Process steal with answer data
   */
  processSteal: (isCorrect, answerIndex, answers) => {
    if (isCorrect && answers && answerIndex !== null) {
      const answerPoints = answers[answerIndex]?.points || 0;
      const remainingPoints = scoringEngine.calculateRemainingPointsFromAnswers(answers);
      
      // Override the calculateRemainingPoints method temporarily
      const originalMethod = scoringEngine.calculateRemainingPoints;
      scoringEngine.calculateRemainingPoints = () => remainingPoints;
      
      const result = scoringEngine.processStealAttempt(isCorrect, answerIndex, answerPoints);
      
      // Restore original method
      scoringEngine.calculateRemainingPoints = originalMethod;
      
      return result;
    }
    
    return scoringEngine.processStealAttempt(isCorrect);
  },

  /**
   * Get formatted score display
   */
  getFormattedScores: () => {
    const state = scoringEngine.getGameState();
    return {
      teamA: {
        name: state.teams.A.name,
        score: state.teams.A.score.toLocaleString(),
        strikes: state.teams.A.strikes
      },
      teamB: {
        name: state.teams.B.name,
        score: state.teams.B.score.toLocaleString(),
        strikes: state.teams.B.strikes
      },
      round: state.currentRound,
      multiplier: state.roundMultiplier
    };
  }
};

export default { ScoringEngine, scoringEngine, scoringHelpers };