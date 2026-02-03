/**
 * Active Game Helper Library
 * Simplified game management with Socket.IO integration
 */

const API_BASE = '/api/active-game';

export const activeGameAPI = {
  // Get or create game by code
  async getGame(gameCode) {
    const response = await fetch(`${API_BASE}?code=${gameCode}`);
    return await response.json();
  },
  
  // Add team to game
  async addTeam(gameCode, teamName) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'add-team',
        data: { teamName }
      })
    });
    return await response.json();
  },
  
  // Add player to team
  async addPlayer(gameCode, teamName, playerName, socketId) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'add-player',
        data: { teamName, playerName, socketId }
      })
    });
    return await response.json();
  },
  
  // Update score
  async updateScore(gameCode, teamName, points) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'update-score',
        data: { teamName, points }
      })
    });
    return await response.json();
  },
  
  // Add strike
  async addStrike(gameCode, teamName) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'add-strike',
        data: { teamName }
      })
    });
    return await response.json();
  },
  
  // Reveal answer
  async revealAnswer(gameCode, answerIndex) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'reveal-answer',
        data: { answerIndex }
      })
    });
    return await response.json();
  },
  
  // Enable buzzer
  async enableBuzzer(gameCode) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'enable-buzzer',
        data: {}
      })
    });
    return await response.json();
  },
  
  // Disable buzzer
  async disableBuzzer(gameCode) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'disable-buzzer',
        data: {}
      })
    });
    return await response.json();
  },
  
  // Set buzzer winner
  async setBuzzerWinner(gameCode, teamName, playerName) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'set-buzzer-winner',
        data: { teamName, playerName }
      })
    });
    return await response.json();
  },
  
  // Set current question
  async setQuestion(gameCode, question, questionIndex) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'set-question',
        data: { question, questionIndex }
      })
    });
    return await response.json();
  },
  
  // Add connected client
  async addClient(gameCode, socketId, role, teamName = null) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'add-client',
        data: { socketId, role, teamName }
      })
    });
    return await response.json();
  },
  
  // Remove connected client
  async removeClient(gameCode, socketId) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameCode,
        action: 'remove-client',
        data: { socketId }
      })
    });
    return await response.json();
  },
  
  // Delete game
  async deleteGame(gameCode) {
    const response = await fetch(`${API_BASE}?code=${gameCode}`, {
      method: 'DELETE'
    });
    return await response.json();
  }
};

// Generate random game code
export function generateGameCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Socket.IO event helpers
export const gameEvents = {
  // Room name for game
  room: (gameCode) => `game-${gameCode.toUpperCase()}`,
  
  // Event names
  BUZZER_READY: 'buzzer-ready',
  BUZZER_RESET: 'buzzer-reset',
  BUZZER_PRESSED: 'buzzer-pressed',
  ANSWER_REVEALED: 'answer-revealed',
  SCORE_UPDATED: 'score-updated',
  GAME_STATE_UPDATED: 'game-state-updated',
  TEAM_JOINED: 'team-joined',
  
  // Emit to game room
  emitToGame: (io, gameCode, event, data) => {
    io.to(gameEvents.room(gameCode)).emit(event, data);
  }
};
