const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join game room
    socket.on('join-game', (gameId) => {
      socket.join(`game-${gameId}`);
      console.log(`Socket ${socket.id} joined game ${gameId}`);
      
      // Notify others in the room
      socket.to(`game-${gameId}`).emit('player-joined', {
        socketId: socket.id,
        timestamp: Date.now()
      });
    });

    // Leave game room
    socket.on('leave-game', (gameId) => {
      socket.leave(`game-${gameId}`);
      console.log(`Socket ${socket.id} left game ${gameId}`);
    });

    // Handle buzzer press
    socket.on('buzzer-press', (data) => {
      const { gameId, teamId, playerId, playerName, timestamp } = data;
      
      console.log(`Buzzer pressed in game ${gameId} by ${playerName} from team ${teamId}`);
      
      // Broadcast to all clients in the game room
      io.to(`game-${gameId}`).emit('buzzer-pressed', {
        teamId,
        playerId,
        playerName,
        timestamp,
        socketId: socket.id
      });
    });

    // Buzzer control events
    socket.on('buzzer-ready', (gameId) => {
      console.log(`Buzzer enabled for game ${gameId}`);
      io.to(`game-${gameId}`).emit('buzzer-ready');
    });

    socket.on('buzzer-reset', (gameId) => {
      console.log(`Buzzer reset for game ${gameId}`);
      io.to(`game-${gameId}`).emit('buzzer-reset');
    });

    socket.on('buzz-winner', (data) => {
      const { gameId, winner } = data;
      console.log(`Buzz winner in game ${gameId}: ${winner}`);
      io.to(`game-${gameId}`).emit('buzz-winner', winner);
    });

    // Game state updates
    socket.on('game-update', (data) => {
      const { gameId, ...updateData } = data;
      
      socket.to(`game-${gameId}`).emit('game-state-updated', {
        ...updateData,
        timestamp: Date.now()
      });
    });

    // Answer reveals
    socket.on('reveal-answer', (data) => {
      const { gameId, ...answerData } = data;
      
      console.log(`Answer revealed in game ${gameId}:`, answerData);
      
      // Broadcast to all clients in the game room
      io.to(`game-${gameId}`).emit('answer-revealed', {
        ...answerData,
        timestamp: Date.now()
      });
    });

    // Game state updates from host
    socket.on('host-game-update', (data) => {
      const { gameId, ...updateData } = data;
      
      console.log(`Host game update for game ${gameId}:`, updateData);
      
      // Broadcast to all clients in the game room
      socket.to(`game-${gameId}`).emit('game-state-updated', {
        ...updateData,
        timestamp: Date.now()
      });
    });

    // Timer updates
    socket.on('timer-update', (data) => {
      const { gameId, ...timerData } = data;
      
      io.to(`game-${gameId}`).emit('timer-updated', {
        ...timerData,
        timestamp: Date.now()
      });
    });

    // Strike events
    socket.on('add-strike', (data) => {
      const { gameId, ...strikeData } = data;
      
      io.to(`game-${gameId}`).emit('strike-added', {
        ...strikeData,
        timestamp: Date.now()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server initialized`);
    });
});