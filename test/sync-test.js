/**
 * Real-time Synchronization Test
 * Tests the synchronization between Control Panel and Game Page
 */

const testSynchronization = async () => {
  console.log('🧪 Testing Control Panel ↔ Game Page Synchronization...');
  
  try {
    // Test 1: Check Socket.IO connection
    console.log('1. Testing Socket.IO connection...');
    const socket = window.io ? window.io() : null;
    if (socket) {
      console.log('✅ Socket.IO available');
      console.log('Connection status:', socket.connected ? 'Connected' : 'Disconnected');
    } else {
      console.log('❌ Socket.IO not available');
    }
    
    // Test 2: Check shared game state
    console.log('2. Testing shared game state...');
    if (window.gameStateManager) {
      const state = window.gameStateManager.getState();
      console.log('✅ Shared game state:', state);
    } else {
      console.log('❌ Shared game state not available');
    }
    
    // Test 3: Simulate answer reveal
    console.log('3. Testing answer reveal synchronization...');
    if (socket) {
      socket.emit('reveal-answer', {
        gameId: 'test-game',
        answerIndex: 0,
        answer: { text: 'Test Answer', points: 100 },
        questionIndex: 0
      });
      console.log('✅ Answer reveal event sent');
    }
    
    // Test 4: Simulate next question
    console.log('4. Testing next question synchronization...');
    if (socket) {
      socket.emit('game-update', {
        gameId: 'test-game',
        nextQuestion: {
          questionIndex: 1,
          round: 1,
          questionInRound: 2
        },
        currentQuestionIndex: 1,
        currentRound: 1
      });
      console.log('✅ Next question event sent');
    }
    
    // Test 5: Listen for events
    console.log('5. Setting up event listeners...');
    if (socket) {
      socket.on('answer-revealed', (data) => {
        console.log('📡 Received answer-revealed:', data);
      });
      
      socket.on('game-state-updated', (data) => {
        console.log('📡 Received game-state-updated:', data);
      });
      
      console.log('✅ Event listeners set up');
    }
    
    console.log('🎉 Synchronization Test Complete!');
    console.log('📋 Instructions:');
    console.log('1. Open Control Panel in one tab: /control');
    console.log('2. Open Game Page in another tab: /game');
    console.log('3. Reveal answers in Control Panel');
    console.log('4. Check if answers appear in Game Page immediately');
    console.log('5. Move to next question in Control Panel');
    console.log('6. Check if Game Page updates to show new question');
    
  } catch (error) {
    console.error('❌ Synchronization test failed:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testSynchronization = testSynchronization;
  window.gameStateManager = window.gameStateManager || null;
}

export default testSynchronization;