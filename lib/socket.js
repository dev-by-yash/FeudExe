import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join game room
      socket.on('join-game', (gameId) => {
        socket.join(`game-${gameId}`);
        console.log(`Socket ${socket.id} joined game ${gameId}`);
      });

      // Leave game room
      socket.on('leave-game', (gameId) => {
        socket.leave(`game-${gameId}`);
        console.log(`Socket ${socket.id} left game ${gameId}`);
      });

      // Handle buzzer press
      socket.on('buzzer-press', (data) => {
        const { gameId, teamId, playerId, playerName, timestamp } = data;
        
        // Broadcast to all clients in the game room
        socket.to(`game-${gameId}`).emit('buzzer-pressed', {
          teamId,
          playerId,
          playerName,
          timestamp,
          socketId: socket.id
        });

        console.log(`Buzzer pressed in game ${gameId} by team ${teamId}, player ${playerId}`);
      });

      // Handle game state updates
      socket.on('game-update', (data) => {
        const { gameId, gameState, currentQuestion, scores } = data;
        
        socket.to(`game-${gameId}`).emit('game-state-updated', {
          gameState,
          currentQuestion,
          scores,
          timestamp: Date.now()
        });
      });

      // Handle answer reveals
      socket.on('reveal-answer', (data) => {
        const { gameId, answerIndex, answer, points, teamId } = data;
        
        socket.to(`game-${gameId}`).emit('answer-revealed', {
          answerIndex,
          answer,
          points,
          teamId,
          timestamp: Date.now()
        });
      });

      // Handle timer updates
      socket.on('timer-update', (data) => {
        const { gameId, timeRemaining, isActive } = data;
        
        socket.to(`game-${gameId}`).emit('timer-updated', {
          timeRemaining,
          isActive,
          timestamp: Date.now()
        });
      });

      // Handle strikes
      socket.on('add-strike', (data) => {
        const { gameId, teamId, strikes } = data;
        
        socket.to(`game-${gameId}`).emit('strike-added', {
          teamId,
          strikes,
          timestamp: Date.now()
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Utility functions for emitting events
export const emitToGame = (gameId, event, data) => {
  if (io) {
    io.to(`game-${gameId}`).emit(event, data);
  }
};

export const emitBuzzerPressed = (gameId, buzzerData) => {
  emitToGame(gameId, 'buzzer-pressed', buzzerData);
};

export const emitGameStateUpdate = (gameId, gameData) => {
  emitToGame(gameId, 'game-state-updated', gameData);
};

export const emitAnswerRevealed = (gameId, answerData) => {
  emitToGame(gameId, 'answer-revealed', answerData);
};

export const emitTimerUpdate = (gameId, timerData) => {
  emitToGame(gameId, 'timer-updated', timerData);
};