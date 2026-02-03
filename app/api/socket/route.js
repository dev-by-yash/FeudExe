import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

let io;

export async function GET() {
  if (!io) {
    return NextResponse.json({ error: 'Socket.IO not initialized' }, { status: 500 });
  }
  
  return NextResponse.json({ 
    success: true, 
    connected: io.engine.clientsCount,
    message: 'Socket.IO server is running' 
  });
}

export async function POST(request) {
  const { action, gameId, data } = await request.json();
  
  if (!io) {
    return NextResponse.json({ error: 'Socket.IO not initialized' }, { status: 500 });
  }

  try {
    switch (action) {
      case 'buzzer-ready':
        io.to(`game-${gameId}`).emit('buzzer-ready');
        break;
      
      case 'buzz-winner':
        io.to(`game-${gameId}`).emit('buzz-winner', data.winner);
        break;
      
      case 'game-update':
        io.to(`game-${gameId}`).emit('game-state-updated', data);
        break;
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Initialize Socket.IO server
export function initializeSocket(server) {
  if (io) return io;

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
      
      console.log(`Buzzer pressed in game ${gameId} by ${playerName} (${teamId})`);
      
      // Broadcast to all clients in the game room
      io.to(`game-${gameId}`).emit('buzzer-pressed', {
        teamId,
        playerId,
        playerName,
        timestamp,
        socketId: socket.id
      });
    });

    // Handle game state updates
    socket.on('game-update', (data) => {
      const { gameId, ...updateData } = data;
      
      socket.to(`game-${gameId}`).emit('game-state-updated', {
        ...updateData,
        timestamp: Date.now()
      });
    });

    // Handle answer reveals
    socket.on('reveal-answer', (data) => {
      const { gameId, ...answerData } = data;
      
      socket.to(`game-${gameId}`).emit('answer-revealed', {
        ...answerData,
        timestamp: Date.now()
      });
    });

    // Handle timer updates
    socket.on('timer-update', (data) => {
      const { gameId, ...timerData } = data;
      
      socket.to(`game-${gameId}`).emit('timer-updated', {
        ...timerData,
        timestamp: Date.now()
      });
    });

    // Handle strikes
    socket.on('add-strike', (data) => {
      const { gameId, ...strikeData } = data;
      
      socket.to(`game-${gameId}`).emit('strike-added', {
        ...strikeData,
        timestamp: Date.now()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export { io };