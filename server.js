const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store buzzer state per game for new clients joining
const gameBuzzerStates = new Map();

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
    socket.on('join-game', (gameCode) => {
      const roomName = `game-${gameCode}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room [${roomName}] (gameCode: ${gameCode})`);

      // Notify others in the room
      socket.to(roomName).emit('player-joined', {
        socketId: socket.id,
        timestamp: Date.now()
      });
      
      // Send current buzzer state to new client
      const buzzerState = gameBuzzerStates.get(gameCode);
      if (buzzerState === 'ready') {
        console.log(`   📤 Sending current buzzer state (ready) to new client ${socket.id}`);
        socket.emit('buzzer-ready');
      }
    });

    // Leave game room
    socket.on('leave-game', (gameCode) => {
      socket.leave(`game-${gameCode}`);
      console.log(`Socket ${socket.id} left game ${gameCode}`);
    });

    // Handle team joining
    socket.on('team-joined', async (data) => {
      const { gameCode, teamName, timestamp } = data;
      console.log(`👥 Team "${teamName}" joined game ${gameCode}`);

      try {
        // Add team to ActiveGame in database
        const response = await fetch(`http://localhost:${port}/api/active-game`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameCode,
            action: 'add-team',
            data: { teamName }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Team "${teamName}" added to ActiveGame`);
          
          // Broadcast team joined to all clients in the room
          io.to(`game-${gameCode}`).emit('team-joined-success', {
            teamName,
            teams: result.game.teams,
            timestamp: Date.now()
          });
        } else {
          console.error(`❌ Failed to add team: ${result.error}`);
        }
      } catch (error) {
        console.error(`❌ Error adding team to ActiveGame:`, error.message);
      }
    });

    // Handle buzzer press
    socket.on('buzzer-press', (data) => {
      const { gameCode, teamId, playerId, playerName, timestamp } = data;

      console.log(`Buzzer pressed in game ${gameCode} by ${playerName} from team ${teamId}`);

      // Broadcast to all clients in the game room
      io.to(`game-${gameCode}`).emit('buzzer-pressed', {
        teamId,
        playerId,
        playerName,
        timestamp,
        socketId: socket.id
      });
    });

    // Buzzer control events
    socket.on('buzzer-ready', (gameCode) => {
      const roomName = `game-${gameCode}`;
      console.log(`🔔 Buzzer enabled for room [${roomName}] (gameCode: ${gameCode})`);

      // Store buzzer state
      gameBuzzerStates.set(gameCode, 'ready');

      // Check how many sockets are in this room
      const room = io.sockets.adapter.rooms.get(roomName);
      const clientsInRoom = room ? Array.from(room) : [];
      console.log(`   Room [${roomName}] has ${clientsInRoom.length} clients:`);
      clientsInRoom.forEach(socketId => {
        console.log(`      - Socket ${socketId}`);
      });

      // Broadcast to ALL clients in the room
      io.to(roomName).emit('buzzer-ready');
      console.log(`   ✅ Sent buzzer-ready event to ${clientsInRoom.length} clients in room [${roomName}]`);
    });

    socket.on('buzzer-reset', (gameCode) => {
      const roomName = `game-${gameCode}`;
      console.log(`🔄 Buzzer reset for room [${roomName}] (gameCode: ${gameCode})`);
      
      // Store buzzer state
      gameBuzzerStates.set(gameCode, 'disabled');
      
      io.to(roomName).emit('buzzer-reset');
    });

    socket.on('buzz-winner', (data) => {
      const { gameCode, winner } = data;
      console.log(`Buzz winner in game ${gameCode}: ${winner}`);
      io.to(`game-${gameCode}`).emit('buzz-winner', winner);
    });

    // Game state updates
    socket.on('game-update', (data) => {
      const { gameCode, gameId, ...updateData } = data;
      const targetGameCode = gameCode || gameId; // Support both for backward compatibility

      // Broadcast to ALL clients in the game room (including sender)
      io.to(`game-${targetGameCode}`).emit('game-state-updated', {
        ...updateData,
        timestamp: Date.now()
      });
      
      console.log(`📡 Game state broadcasted to room [game-${targetGameCode}]`);
    });

    // Answer reveals
    socket.on('reveal-answer', (data) => {
      const { gameCode, gameId, ...answerData } = data;
      const targetGameCode = gameCode || gameId; // Support both for backward compatibility

      console.log(`Answer revealed in game ${targetGameCode}:`, answerData);

      // Broadcast to all clients in the game room
      io.to(`game-${targetGameCode}`).emit('answer-revealed', {
        ...answerData,
        timestamp: Date.now()
      });
    });

    // Game state updates from host
    socket.on('host-game-update', (data) => {
      const { gameCode, gameId, ...updateData } = data;
      const targetGameCode = gameCode || gameId; // Support both for backward compatibility

      console.log(`Host game update for game ${targetGameCode}:`, updateData);

      // Broadcast to ALL clients in the game room (including sender)
      io.to(`game-${targetGameCode}`).emit('game-state-updated', {
        ...updateData,
        timestamp: Date.now()
      });
    });

    // Timer updates
    socket.on('timer-update', (data) => {
      const { gameCode, gameId, ...timerData } = data;
      const targetGameCode = gameCode || gameId; // Support both for backward compatibility

      io.to(`game-${targetGameCode}`).emit('timer-updated', {
        ...timerData,
        timestamp: Date.now()
      });
    });

    // Strike events
    socket.on('add-strike', (data) => {
      const { gameCode, gameId, ...strikeData } = data;
      const targetGameCode = gameCode || gameId; // Support both for backward compatibility

      io.to(`game-${targetGameCode}`).emit('strike-added', {
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