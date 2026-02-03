// API utility functions for frontend

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}/api${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API call failed');
  }

  return data;
}

// Team API functions
export const teamAPI = {
  // Get all teams
  getAll: () => apiCall('/teams'),
  
  // Create new team
  create: (teamData) => apiCall('/teams', {
    method: 'POST',
    body: teamData,
  }),
  
  // Get specific team
  getById: (id) => apiCall(`/teams/${id}`),
  
  // Update team
  update: (id, updates) => apiCall(`/teams/${id}`, {
    method: 'PUT',
    body: updates,
  }),
  
  // Delete team
  delete: (id) => apiCall(`/teams/${id}`, {
    method: 'DELETE',
  }),
  
  // Add player to team
  addPlayer: (teamId, playerData) => apiCall(`/teams/${teamId}/players`, {
    method: 'POST',
    body: playerData,
  }),
  
  // Remove player from team
  removePlayer: (teamId, playerName) => apiCall(`/teams/${teamId}/players?name=${encodeURIComponent(playerName)}`, {
    method: 'DELETE',
  }),
};

// Question API functions
export const questionAPI = {
  // Get all questions with optional filters
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/questions?${params}`);
  },
  
  // Create new question
  create: (questionData) => apiCall('/questions', {
    method: 'POST',
    body: questionData,
  }),
  
  // Get specific question
  getById: (id) => apiCall(`/questions/${id}`),
  
  // Update question
  update: (id, updates) => apiCall(`/questions/${id}`, {
    method: 'PUT',
    body: updates,
  }),
  
  // Delete question
  delete: (id) => apiCall(`/questions/${id}`, {
    method: 'DELETE',
  }),
  
  // Get all categories
  getCategories: () => apiCall('/questions/categories'),
};

// Game API functions
export const gameAPI = {
  // Get all games
  getAll: () => apiCall('/games'),
  
  // Create new game
  create: (gameData) => apiCall('/games', {
    method: 'POST',
    body: gameData,
  }),
  
  // Get specific game
  getById: (id) => apiCall(`/games/${id}`),
  
  // Update game
  update: (id, updates) => apiCall(`/games/${id}`, {
    method: 'PUT',
    body: updates,
  }),
  
  // Delete game
  delete: (id) => apiCall(`/games/${id}`, {
    method: 'DELETE',
  }),
  
  // Start game
  start: (id, startData) => apiCall(`/games/${id}/start`, {
    method: 'POST',
    body: startData,
  }),
  
  // Handle buzzer press
  buzzer: (id, buzzerData) => apiCall(`/games/${id}/buzzer`, {
    method: 'POST',
    body: buzzerData,
  }),
  
  // Submit answer
  answer: (id, answerData) => apiCall(`/games/${id}/answer`, {
    method: 'POST',
    body: answerData,
  }),
};

// Settings API functions
export const settingsAPI = {
  // Get settings
  get: () => apiCall('/settings'),
  
  // Update settings
  update: (settings) => apiCall('/settings', {
    method: 'PUT',
    body: settings,
  }),
};

// Leaderboard API functions
export const leaderboardAPI = {
  // Get leaderboard
  get: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return apiCall(`/leaderboard?${searchParams}`);
  },
};

// Socket.IO helper functions
export const socketEvents = {
  // Game events
  JOIN_GAME: 'join-game',
  LEAVE_GAME: 'leave-game',
  BUZZER_PRESS: 'buzzer-press',
  GAME_UPDATE: 'game-update',
  REVEAL_ANSWER: 'reveal-answer',
  TIMER_UPDATE: 'timer-update',
  ADD_STRIKE: 'add-strike',
  
  // Server events
  BUZZER_PRESSED: 'buzzer-pressed',
  GAME_STATE_UPDATED: 'game-state-updated',
  ANSWER_REVEALED: 'answer-revealed',
  TIMER_UPDATED: 'timer-updated',
  STRIKE_ADDED: 'strike-added',
};

// Utility functions
export const utils = {
  // Format score with commas
  formatScore: (score) => {
    return score.toLocaleString();
  },
  
  // Calculate win rate percentage
  calculateWinRate: (gamesWon, gamesPlayed) => {
    if (gamesPlayed === 0) return 0;
    return Math.round((gamesWon / gamesPlayed) * 100);
  },
  
  // Format time remaining
  formatTime: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
  
  // Generate random game ID
  generateGameId: () => {
    return Math.random().toString(36).substr(2, 9);
  },
  
  // Validate team name
  validateTeamName: (name) => {
    if (!name || !name.trim()) {
      throw new Error('Team name is required');
    }
    if (name.trim().length < 2) {
      throw new Error('Team name must be at least 2 characters');
    }
    if (name.trim().length > 50) {
      throw new Error('Team name must be less than 50 characters');
    }
    return name.trim();
  },
  
  // Validate player name
  validatePlayerName: (name) => {
    if (!name || !name.trim()) {
      throw new Error('Player name is required');
    }
    if (name.trim().length < 1) {
      throw new Error('Player name cannot be empty');
    }
    if (name.trim().length > 30) {
      throw new Error('Player name must be less than 30 characters');
    }
    return name.trim();
  },
};