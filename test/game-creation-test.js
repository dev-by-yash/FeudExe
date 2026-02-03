/**
 * Game Creation Test
 * Tests if the game creation validation error is fixed
 */

const testGameCreation = async () => {
  console.log('🧪 Testing Game Creation Fix...');
  
  try {
    // Test 1: Check if teams exist
    console.log('1. Testing team availability...');
    const teamsResponse = await fetch('/api/teams');
    const teamsData = await teamsResponse.json();
    
    if (!teamsData.teams || teamsData.teams.length < 2) {
      console.log('❌ Need at least 2 teams to test game creation');
      console.log('Available teams:', teamsData.teams?.length || 0);
      return;
    }
    
    console.log(`✅ Found ${teamsData.teams.length} teams`);
    
    // Test 2: Try to create a game
    console.log('2. Testing game creation...');
    const gameResponse = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamIds: teamsData.teams.slice(0, 2).map(t => t._id),
        settings: {
          teamSize: 4,
          maxStrikes: 3,
          questionTimeLimit: 30
        }
      })
    });
    
    const gameData = await gameResponse.json();
    
    if (gameData.success) {
      console.log('✅ Game created successfully!');
      console.log('Game ID:', gameData.game._id);
      console.log('Game State:', gameData.game.gameState);
      console.log('Teams:', gameData.game.teams.map(t => t.name));
      
      // Test 3: Verify the game state is valid
      if (gameData.game.gameState === 'setup') {
        console.log('✅ Game state is valid (setup)');
      } else {
        console.log('⚠️ Unexpected game state:', gameData.game.gameState);
      }
      
    } else {
      console.log('❌ Game creation failed:', gameData.error);
    }
    
    console.log('🎉 Game Creation Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testGameCreation = testGameCreation;
}

export default testGameCreation;