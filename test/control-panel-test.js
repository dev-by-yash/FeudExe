/**
 * Control Panel Integration Test
 * Tests the complete functionality of the control panel with database
 */

const testControlPanel = async () => {
  console.log('🧪 Testing Control Panel Integration...');
  
  try {
    // Test 1: Load teams from database
    console.log('1. Testing team loading...');
    const teamsResponse = await fetch('/api/teams');
    const teamsData = await teamsResponse.json();
    console.log(`✅ Teams loaded: ${teamsData.teams?.length || 0} teams`);
    
    // Test 2: Load questions from database
    console.log('2. Testing question loading...');
    const questionsResponse = await fetch('/api/questions');
    const questionsData = await questionsResponse.json();
    console.log(`✅ Questions loaded: ${questionsData.questions?.length || 0} questions`);
    
    // Test 3: Create a new game
    if (teamsData.teams && teamsData.teams.length >= 2) {
      console.log('3. Testing game creation...');
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
      console.log(`✅ Game created: ${gameData.game?._id}`);
      
      // Test 4: Start a question
      if (gameData.game && questionsData.questions && questionsData.questions.length > 0) {
        console.log('4. Testing question start...');
        const startResponse = await fetch(`/api/games/${gameData.game._id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: questionsData.questions[0]._id
          })
        });
        const startData = await startResponse.json();
        console.log(`✅ Question started: ${startData.success}`);
        
        // Test 5: Submit an answer
        console.log('5. Testing answer submission...');
        const answerResponse = await fetch(`/api/games/${gameData.game._id}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answerIndex: 0,
            isCorrect: true
          })
        });
        const answerData = await answerResponse.json();
        console.log(`✅ Answer submitted: ${answerData.success}`);
      }
    }
    
    console.log('🎉 Control Panel Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testControlPanel = testControlPanel;
}

export default testControlPanel;