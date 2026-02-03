# Backend Testing Guide

## Prerequisites
1. Make sure MongoDB is running locally on `mongodb://localhost:27017`
2. Start your Next.js server: `npm run dev`
3. Import sample questions: `npm run import-sample`

## Testing Methods

### 1. Node.js Test Script (Recommended)
```bash
npm run test-api
```
This runs a comprehensive test of all API endpoints with detailed output.

### 2. cURL Commands
```bash
npm run test-curl
```
Or manually run:
```bash
bash test/test-with-curl.sh
```

### 3. Postman Collection
Import `test/postman-collection.json` into Postman for interactive testing.

### 4. Manual cURL Commands

#### Create a Team
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Team",
    "players": [
      {"name": "Player 1"},
      {"name": "Player 2"}
    ]
  }'
```

#### Get All Teams
```bash
curl http://localhost:3000/api/teams
```

#### Create a Question
```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Test",
    "question": "Name a color",
    "answers": [
      {"text": "Red", "points": 40},
      {"text": "Blue", "points": 30},
      {"text": "Green", "points": 20},
      {"text": "Yellow", "points": 10}
    ]
  }'
```

#### Get All Questions
```bash
curl http://localhost:3000/api/questions
```

#### Create a Game
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{
    "teamIds": ["TEAM1_ID", "TEAM2_ID"],
    "settings": {
      "teamSize": 4,
      "maxStrikes": 3,
      "questionTimeLimit": 30
    }
  }'
```

#### Start a Game
```bash
curl -X POST http://localhost:3000/api/games/GAME_ID/start \
  -H "Content-Type: application/json" \
  -d '{"questionId": "QUESTION_ID"}'
```

#### Press Buzzer
```bash
curl -X POST http://localhost:3000/api/games/GAME_ID/buzzer \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "TEAM_ID",
    "playerId": "player1"
  }'
```

#### Submit Answer
```bash
curl -X POST http://localhost:3000/api/games/GAME_ID/answer \
  -H "Content-Type: application/json" \
  -d '{
    "answerIndex": 0,
    "isCorrect": true
  }'
```

#### Get Leaderboard
```bash
curl http://localhost:3000/api/leaderboard
```

#### Get/Update Settings
```bash
# Get settings
curl http://localhost:3000/api/settings

# Update settings
curl -X PUT http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "teamSize": 6,
    "maxStrikes": 4,
    "questionTimeLimit": 45
  }'
```

## Test Flow Example

1. **Setup**: Create 2 teams and some questions
2. **Game Creation**: Create a game with the teams
3. **Start Game**: Start with a specific question
4. **Buzzer**: Simulate buzzer press from a team
5. **Answer**: Submit correct/wrong answers
6. **Check Results**: View updated scores and game state

## Expected Responses

### Successful Team Creation
```json
{
  "success": true,
  "team": {
    "_id": "...",
    "name": "Test Team",
    "players": [...],
    "score": 0,
    "gamesPlayed": 0,
    "gamesWon": 0
  }
}
```

### Game State After Buzzer
```json
{
  "success": true,
  "game": {
    "_id": "...",
    "gameState": "answering",
    "currentTeamTurn": "...",
    "timer": {
      "duration": 10,
      "isActive": true
    }
  }
}
```

## Troubleshooting

### Common Issues
1. **Connection refused**: Make sure server is running on port 3000
2. **MongoDB errors**: Ensure MongoDB is running locally
3. **404 errors**: Check API endpoint URLs
4. **Validation errors**: Check request body format

### Debug Tips
- Check server console for error messages
- Use `console.log` in API routes for debugging
- Verify MongoDB connection in server logs
- Test one endpoint at a time

## Socket.IO Testing

For real-time features, you'll need a Socket.IO client. You can test with:

1. **Browser Console**:
```javascript
const socket = io('http://localhost:3000');
socket.emit('join-game', 'gameId');
socket.on('buzzer-pressed', (data) => console.log(data));
```

2. **Node.js Socket Client**:
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');
socket.emit('buzzer-press', {
  gameId: 'gameId',
  teamId: 'teamId',
  playerId: 'playerId',
  timestamp: Date.now()
});
```