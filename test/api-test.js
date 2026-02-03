// Backend API Testing Script
// Run with: node test/api-test.js

const BASE_URL = 'http://localhost:3000/api';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
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

  try {
    console.log(`\n🔄 ${config.method || 'GET'} ${endpoint}`);
    if (config.body) {
      console.log('📤 Request body:', config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`📊 Status: ${response.status}`);
    console.log('📥 Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.error || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test functions
async function testTeamAPI() {
  console.log('\n🏆 TESTING TEAM API');
  console.log('='.repeat(50));

  // Create teams
  const team1 = await apiCall('/teams', {
    method: 'POST',
    body: {
      name: 'Team Alpha',
      players: [
        { name: 'Alice' },
        { name: 'Bob' }
      ]
    }
  });

  const team2 = await apiCall('/teams', {
    method: 'POST',
    body: {
      name: 'Team Beta',
      players: [
        { name: 'Charlie' },
        { name: 'Diana' }
      ]
    }
  });

  // Get all teams
  await apiCall('/teams');

  // Add player to team
  if (team1?.team?._id) {
    await apiCall(`/teams/${team1.team._id}/players`, {
      method: 'POST',
      body: { name: 'Eve' }
    });
  }

  // Get specific team
  if (team1?.team?._id) {
    await apiCall(`/teams/${team1.team._id}`);
  }

  return { team1: team1?.team, team2: team2?.team };
}

async function testQuestionAPI() {
  console.log('\n❓ TESTING QUESTION API');
  console.log('='.repeat(50));

  // Create a question
  const question = await apiCall('/questions', {
    method: 'POST',
    body: {
      category: 'Test Category',
      question: 'Name something you do in the morning',
      answers: [
        { text: 'Brush teeth', points: 35 },
        { text: 'Take shower', points: 28 },
        { text: 'Eat breakfast', points: 22 },
        { text: 'Get dressed', points: 15 }
      ],
      difficulty: 'easy'
    }
  });

  // Get all questions
  await apiCall('/questions');

  // Get categories
  await apiCall('/questions/categories');

  // Get questions by category
  await apiCall('/questions?category=Test Category');

  return question?.question;
}

async function testGameAPI(team1, team2, question) {
  console.log('\n🎮 TESTING GAME API');
  console.log('='.repeat(50));

  if (!team1?._id || !team2?._id) {
    console.log('❌ Cannot test game API - teams not created');
    return;
  }

  // Create a game
  const game = await apiCall('/games', {
    method: 'POST',
    body: {
      teamIds: [team1._id, team2._id],
      settings: {
        teamSize: 4,
        maxStrikes: 3,
        questionTimeLimit: 30
      }
    }
  });

  // Get all games
  await apiCall('/games');

  // Start game
  if (game?.game?._id && question?._id) {
    await apiCall(`/games/${game.game._id}/start`, {
      method: 'POST',
      body: {
        questionId: question._id
      }
    });

    // Simulate buzzer press
    await apiCall(`/games/${game.game._id}/buzzer`, {
      method: 'POST',
      body: {
        teamId: team1._id,
        playerId: 'player1'
      }
    });

    // Simulate correct answer
    await apiCall(`/games/${game.game._id}/answer`, {
      method: 'POST',
      body: {
        answerIndex: 0,
        isCorrect: true
      }
    });

    // Get updated game
    await apiCall(`/games/${game.game._id}`);
  }

  return game?.game;
}

async function testSettingsAPI() {
  console.log('\n⚙️ TESTING SETTINGS API');
  console.log('='.repeat(50));

  // Get settings
  await apiCall('/settings');

  // Update settings
  await apiCall('/settings', {
    method: 'PUT',
    body: {
      teamSize: 6,
      maxStrikes: 4,
      questionTimeLimit: 45,
      buzzerTimeLimit: 8
    }
  });

  // Get updated settings
  await apiCall('/settings');
}

async function testLeaderboardAPI() {
  console.log('\n🏅 TESTING LEADERBOARD API');
  console.log('='.repeat(50));

  // Get leaderboard
  await apiCall('/leaderboard');

  // Get leaderboard sorted by games won
  await apiCall('/leaderboard?sortBy=gamesWon&limit=5');
}

// Main test function
async function runAllTests() {
  console.log('🚀 STARTING BACKEND API TESTS');
  console.log('='.repeat(50));
  console.log('Make sure your server is running on http://localhost:3000');
  console.log('='.repeat(50));

  try {
    // Test each API
    const { team1, team2 } = await testTeamAPI();
    const question = await testQuestionAPI();
    const game = await testGameAPI(team1, team2, question);
    await testSettingsAPI();
    await testLeaderboardAPI();

    console.log('\n✅ ALL TESTS COMPLETED');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, apiCall };