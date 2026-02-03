/**
 * Shared Game State Management
 * Ensures control panel and game route use the same questions and state
 */

class GameStateManager {
  constructor() {
    this.gameState = {
      gameId: null, // Will be set dynamically
      questions: [],
      currentQuestionIndex: 0,
      currentRound: 1,
      teams: [],
      gameActive: false,
      revealedAnswers: []
    };
    this.listeners = [];
  }

  // Set game ID dynamically
  setGameId(gameId) {
    this.gameState.gameId = gameId;
    this.notify();
  }

  // Get current game ID
  getGameId() {
    return this.gameState.gameId;
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of state changes
  notify() {
    this.listeners.forEach(callback => callback(this.gameState));
  }

  // Set game questions (called once when game starts)
  setGameQuestions(questions) {
    this.gameState.questions = questions;
    this.gameState.revealedAnswers = questions.map(() => Array(6).fill(false));
    this.notify();
  }

  // Get current question
  getCurrentQuestion() {
    const { questions, currentQuestionIndex } = this.gameState;
    return questions[currentQuestionIndex] || null;
  }

  // Reveal answer
  revealAnswer(questionIndex, answerIndex) {
    if (this.gameState.revealedAnswers[questionIndex]) {
      this.gameState.revealedAnswers[questionIndex][answerIndex] = true;
      this.notify();
    }
  }

  // Move to next question
  nextQuestion() {
    if (this.gameState.currentQuestionIndex < this.gameState.questions.length - 1) {
      this.gameState.currentQuestionIndex++;
      
      // Update round if needed (3 questions per round)
      const newRound = Math.ceil((this.gameState.currentQuestionIndex + 1) / 3);
      if (newRound !== this.gameState.currentRound) {
        this.gameState.currentRound = newRound;
      }
      
      this.notify();
    }
  }

  // Set teams
  setTeams(teams) {
    this.gameState.teams = teams;
    this.notify();
  }

  // Get game state
  getState() {
    return { ...this.gameState };
  }

  // Update game state
  updateState(updates) {
    this.gameState = { ...this.gameState, ...updates };
    this.notify();
  }

  // Reset game
  reset() {
    this.gameState = {
      gameId: 'default-game',
      questions: [],
      currentQuestionIndex: 0,
      currentRound: 1,
      teams: [],
      gameActive: false,
      revealedAnswers: []
    };
    this.notify();
  }
}

// Create singleton instance
export const gameStateManager = new GameStateManager();

// React hook for using game state
import { useState, useEffect } from 'react';

export const useGameState = () => {
  const [gameState, setGameState] = useState(gameStateManager.getState());

  useEffect(() => {
    const unsubscribe = gameStateManager.subscribe(setGameState);
    return unsubscribe;
  }, []);

  return {
    gameState,
    setGameId: gameStateManager.setGameId.bind(gameStateManager),
    getGameId: gameStateManager.getGameId.bind(gameStateManager),
    setGameQuestions: gameStateManager.setGameQuestions.bind(gameStateManager),
    getCurrentQuestion: gameStateManager.getCurrentQuestion.bind(gameStateManager),
    revealAnswer: gameStateManager.revealAnswer.bind(gameStateManager),
    nextQuestion: gameStateManager.nextQuestion.bind(gameStateManager),
    setTeams: gameStateManager.setTeams.bind(gameStateManager),
    updateState: gameStateManager.updateState.bind(gameStateManager),
    reset: gameStateManager.reset.bind(gameStateManager)
  };
};