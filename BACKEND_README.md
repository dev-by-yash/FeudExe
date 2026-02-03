# Team Feud Game - Backend Documentation

## Overview
This is the backend system for a Family Feud-style team game built with Next.js API routes, MongoDB, and Socket.IO for real-time functionality.

## Features
- **Team Management**: Create teams, add/remove players
- **Question System**: Add questions by category, manage question database
- **Game Engine**: Start games, handle buzzer system, scoring, strikes
- **Real-time Updates**: Socket.IO for live buzzer functionality and game updates
- **Leaderboard**: Track team scores and game statistics
- **Settings**: Customizable game settings (team size, time limits, etc.)

## Tech Stack
- **Database**: MongoDB (local instance)
- **Backend**: Next.js API Routes
- **Real-time**: Socket.IO
- **ODM**: Mongoose

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running locally on `mongodb://localhost:27017`

### 3. Environment Configuration
The `.env.local` file is already configured for local development:
```
MONGODB_URI=mongodb://localhost:27017/feud-game
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Import Sample Questions
```bash
node scripts/import-questions.js scripts/sample-questions.json
```

### 5. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `GET /api/teams/[id]` - Get specific team
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team
- `POST /api/teams/[id]/players` - Add player to team
- `DELETE /api/teams/[id]/players?name=playerName` - Remove player from team

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `POST /api/questions` - Create new question
- `GET /api/questions/[id]` - Get specific question
- `PUT /api/questions/[id]` - Update question
- `DELETE /api/questions/[id]` - Delete question
- `GET /api/questions/categories` - Get all categories

### Games
- `GET /api/games` - Get all games
- `POST /api/games` - Create new game
- `GET /api/games/[id]` - Get specific game
- `PUT /api/games/[id]` - Update game
- `DELETE /api/games/[id]` - Delete game
- `POST /api/games/[id]/start` - Start game with question
- `POST /api/games/[id]/buzzer` - Handle buzzer press
- `POST /api/games/[id]/answer` - Submit answer and reveal

### Settings
- `GET /api/settings` - Get game settings
- `PUT /api/settings` - Update game settings

### Leaderboard
- `GET /api/leaderboard` - Get team leaderboard with stats

## Database Models

### Team
```javascript
{
  name: String (unique),
  players: [{ name: String, joinedAt: Date }],
  score: Number,
  gamesPlayed: Number,
  gamesWon: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Question
```javascript
{
  category: String,
  question: String,
  answers: [{ text: String, points: Number, revealed: Boolean }],
  totalPoints: Number,
  difficulty: String (easy/medium/hard),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Game
```javascript
{
  teams: [{ teamId: ObjectId, name: String, score: Number, strikes: Number }],
  currentQuestion: ObjectId,
  questionHistory: [{ questionId: ObjectId, revealedAnswers: [Number], pointsAwarded: [{ teamId: ObjectId, points: Number }] }],
  gameState: String (waiting/active/buzzer/answering/completed),
  currentTeamTurn: ObjectId,
  timer: { duration: Number, startTime: Date, isActive: Boolean },
  settings: { teamSize: Number, maxStrikes: Number, questionTimeLimit: Number },
  winner: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Settings
```javascript
{
  teamSize: Number,
  maxStrikes: Number,
  questionTimeLimit: Number,
  buzzerTimeLimit: Number,
  pointsToWin: Number,
  categories: [{ name: String, isActive: Boolean }],
  updatedAt: Date
}
```

## Socket.IO Events

### Client to Server
- `join-game` - Join a game room
- `leave-game` - Leave a game room
- `buzzer-press` - Press buzzer (includes teamId, playerId, timestamp)
- `game-update` - Update game state
- `reveal-answer` - Reveal an answer
- `timer-update` - Update timer
- `add-strike` - Add strike to team

### Server to Client
- `buzzer-pressed` - Buzzer was pressed by a team
- `game-state-updated` - Game state changed
- `answer-revealed` - Answer was revealed
- `timer-updated` - Timer updated
- `strike-added` - Strike added to team

## Game Flow

1. **Setup**: Create teams and add players
2. **Start Game**: Select teams and start with a question
3. **Buzzer Phase**: Teams compete to buzz in first
4. **Answer Phase**: Winning team has time to answer
5. **Reveal**: Correct answers are revealed, points awarded
6. **Continue**: Next question or end game

## Buzzer System Implementation

The buzzer system uses Socket.IO for real-time communication:

1. All clients join the game room via Socket.IO
2. When a player presses buzzer, client emits `buzzer-press` event
3. Server broadcasts to all clients in the room
4. First buzzer press wins (handled by timestamp comparison)
5. Game state updates to "answering" mode
6. Timer starts for the answering team

## Question Import System

Use the import script to add questions from JSON:

```bash
node scripts/import-questions.js path/to/questions.json
```

JSON format:
```json
[
  {
    "category": "General Knowledge",
    "question": "Name something people do when they wake up",
    "answers": [
      { "text": "Brush teeth", "points": 32 },
      { "text": "Take a shower", "points": 28 }
    ],
    "difficulty": "easy"
  }
]
```

## Customization

### Team Size
Adjust in settings API or during game creation:
```javascript
{
  "teamSize": 6, // Default: 4
  "maxStrikes": 3,
  "questionTimeLimit": 45
}
```

### Scoring System
Points are defined per answer in questions. Total game scoring can be customized in the game logic.

### Timer Settings
- Question time limit (default: 30 seconds)
- Buzzer time limit (default: 5 seconds)
- Answer time limit (default: 10 seconds)

## Development Notes

- All API routes include error handling and validation
- MongoDB connection is handled via connection pooling
- Socket.IO server is initialized with CORS configuration
- Real-time updates ensure all clients stay synchronized
- Leaderboard updates automatically as games complete

## Next Steps for Frontend Integration

1. Connect Socket.IO client in React components
2. Implement buzzer UI with keyboard/touch controls
3. Create game control panel for revealing answers (numpad 1-9, X for wrong)
4. Build real-time leaderboard display
5. Add game setup wizard for team selection
6. Implement timer displays and animations