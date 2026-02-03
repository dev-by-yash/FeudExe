import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (gameId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [buzzerPressed, setBuzzerPressed] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(null);
  const [timerUpdate, setTimerUpdate] = useState(null);
  const [strikeAdded, setStrikeAdded] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      
      // Join game room if gameId is provided
      if (gameId) {
        socket.emit('join-game', gameId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Game events
    socket.on('buzzer-pressed', (data) => {
      setBuzzerPressed(data);
      console.log('Buzzer pressed:', data);
    });

    socket.on('game-state-updated', (data) => {
      setGameState(data);
      console.log('Game state updated:', data);
    });

    socket.on('answer-revealed', (data) => {
      setAnswerRevealed(data);
      console.log('Answer revealed:', data);
    });

    socket.on('timer-updated', (data) => {
      setTimerUpdate(data);
      console.log('Timer updated:', data);
    });

    socket.on('strike-added', (data) => {
      setStrikeAdded(data);
      console.log('Strike added:', data);
    });

    // Cleanup on unmount
    return () => {
      if (gameId) {
        socket.emit('leave-game', gameId);
      }
      socket.disconnect();
    };
  }, [gameId]);

  // Socket action functions
  const joinGame = (newGameId) => {
    if (socketRef.current && newGameId) {
      socketRef.current.emit('join-game', newGameId);
    }
  };

  const leaveGame = (oldGameId) => {
    if (socketRef.current && oldGameId) {
      socketRef.current.emit('leave-game', oldGameId);
    }
  };

  const pressBuzzer = (teamId, playerId, playerName) => {
    if (socketRef.current && gameId) {
      const buzzerData = {
        gameId,
        teamId,
        playerId,
        playerName,
        timestamp: Date.now()
      };
      socketRef.current.emit('buzzer-press', buzzerData);
      return buzzerData;
    }
    return null;
  };

  const updateGameState = (gameStateData) => {
    if (socketRef.current && gameId) {
      socketRef.current.emit('game-update', {
        gameId,
        ...gameStateData
      });
    }
  };

  const revealAnswer = (answerIndex, answer, points, teamId) => {
    if (socketRef.current && gameId) {
      socketRef.current.emit('reveal-answer', {
        gameId,
        answerIndex,
        answer,
        points,
        teamId
      });
    }
  };

  const updateTimer = (timeRemaining, isActive) => {
    if (socketRef.current && gameId) {
      socketRef.current.emit('timer-update', {
        gameId,
        timeRemaining,
        isActive
      });
    }
  };

  const addStrike = (teamId, strikes) => {
    if (socketRef.current && gameId) {
      socketRef.current.emit('add-strike', {
        gameId,
        teamId,
        strikes
      });
    }
  };

  // Clear event states
  const clearBuzzerPressed = () => setBuzzerPressed(null);
  const clearGameState = () => setGameState(null);
  const clearAnswerRevealed = () => setAnswerRevealed(null);
  const clearTimerUpdate = () => setTimerUpdate(null);
  const clearStrikeAdded = () => setStrikeAdded(null);

  return {
    // Connection state
    isConnected,
    socket: socketRef.current,
    
    // Event data
    buzzerPressed,
    gameState,
    answerRevealed,
    timerUpdate,
    strikeAdded,
    
    // Actions
    joinGame,
    leaveGame,
    pressBuzzer,
    updateGameState,
    revealAnswer,
    updateTimer,
    addStrike,
    
    // Clear functions
    clearBuzzerPressed,
    clearGameState,
    clearAnswerRevealed,
    clearTimerUpdate,
    clearStrikeAdded,
  };
};

// Custom hook for buzzer functionality
export const useBuzzer = (gameId, teamId, playerId, playerName) => {
  const { pressBuzzer, buzzerPressed, clearBuzzerPressed, isConnected } = useSocket(gameId);
  const [canBuzz, setCanBuzz] = useState(true);
  const [buzzCooldown, setBuzzCooldown] = useState(0);

  // Handle buzzer press with cooldown
  const handleBuzzerPress = () => {
    if (!canBuzz || !isConnected) return null;

    const result = pressBuzzer(teamId, playerId, playerName);
    
    if (result) {
      setCanBuzz(false);
      setBuzzCooldown(3); // 3 second cooldown
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setBuzzCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanBuzz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return result;
  };

  // Keyboard event handler for spacebar buzzer
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' && canBuzz) {
        event.preventDefault();
        handleBuzzerPress();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canBuzz, teamId, playerId, playerName]);

  return {
    pressBuzzer: handleBuzzerPress,
    buzzerPressed,
    clearBuzzerPressed,
    canBuzz,
    buzzCooldown,
    isConnected,
  };
};

// Custom hook for game control (host/moderator)
export const useGameControl = (gameId) => {
  const socket = useSocket(gameId);
  
  // Numpad key handler for answer reveals
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      
      // Handle numpad 1-9 for answer reveals
      if (key >= '1' && key <= '9') {
        const answerIndex = parseInt(key) - 1;
        // This would be connected to your game state to reveal the answer
        console.log(`Reveal answer ${answerIndex + 1}`);
      }
      
      // Handle 'X' key for wrong answer
      if (key.toLowerCase() === 'x') {
        console.log('Wrong answer - add strike');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return {
    ...socket,
    // Additional game control methods can be added here
  };
};