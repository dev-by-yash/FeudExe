#!/bin/bash

# Backend API Testing with cURL
# Make sure your server is running on http://localhost:3000

BASE_URL="http://localhost:3000/api"

echo "🚀 TESTING BACKEND APIs WITH CURL"
echo "=================================="

# Test 1: Create Team
echo -e "\n🏆 Creating Team Alpha..."
TEAM1_RESPONSE=$(curl -s -X POST "$BASE_URL/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Alpha",
    "players": [
      {"name": "Alice"},
      {"name": "Bob"}
    ]
  }')
echo "Response: $TEAM1_RESPONSE"

# Extract team ID (basic parsing)
TEAM1_ID=$(echo $TEAM1_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Team 1 ID: $TEAM1_ID"

# Test 2: Create another team
echo -e "\n🏆 Creating Team Beta..."
TEAM2_RESPONSE=$(curl -s -X POST "$BASE_URL/teams" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Beta",
    "players": [
      {"name": "Charlie"},
      {"name": "Diana"}
    ]
  }')
echo "Response: $TEAM2_RESPONSE"

TEAM2_ID=$(echo $TEAM2_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Team 2 ID: $TEAM2_ID"

# Test 3: Get all teams
echo -e "\n📋 Getting all teams..."
curl -s -X GET "$BASE_URL/teams" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/teams"

# Test 4: Add player to team
if [ ! -z "$TEAM1_ID" ]; then
  echo -e "\n👤 Adding player to Team Alpha..."
  curl -s -X POST "$BASE_URL/teams/$TEAM1_ID/players" \
    -H "Content-Type: application/json" \
    -d '{"name": "Eve"}' | jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/teams/$TEAM1_ID/players" \
    -H "Content-Type: application/json" \
    -d '{"name": "Eve"}'
fi

# Test 5: Create a question
echo -e "\n❓ Creating a question..."
QUESTION_RESPONSE=$(curl -s -X POST "$BASE_URL/questions" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "Test Category",
    "question": "Name something you do in the morning",
    "answers": [
      {"text": "Brush teeth", "points": 35},
      {"text": "Take shower", "points": 28},
      {"text": "Eat breakfast", "points": 22},
      {"text": "Get dressed", "points": 15}
    ],
    "difficulty": "easy"
  }')
echo "Response: $QUESTION_RESPONSE"

QUESTION_ID=$(echo $QUESTION_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Question ID: $QUESTION_ID"

# Test 6: Get all questions
echo -e "\n📋 Getting all questions..."
curl -s -X GET "$BASE_URL/questions" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/questions"

# Test 7: Get categories
echo -e "\n📂 Getting categories..."
curl -s -X GET "$BASE_URL/questions/categories" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/questions/categories"

# Test 8: Create a game
if [ ! -z "$TEAM1_ID" ] && [ ! -z "$TEAM2_ID" ]; then
  echo -e "\n🎮 Creating a game..."
  GAME_RESPONSE=$(curl -s -X POST "$BASE_URL/games" \
    -H "Content-Type: application/json" \
    -d "{
      \"teamIds\": [\"$TEAM1_ID\", \"$TEAM2_ID\"],
      \"settings\": {
        \"teamSize\": 4,
        \"maxStrikes\": 3,
        \"questionTimeLimit\": 30
      }
    }")
  echo "Response: $GAME_RESPONSE"
  
  GAME_ID=$(echo $GAME_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
  echo "Game ID: $GAME_ID"
  
  # Test 9: Start the game
  if [ ! -z "$GAME_ID" ] && [ ! -z "$QUESTION_ID" ]; then
    echo -e "\n▶️ Starting the game..."
    curl -s -X POST "$BASE_URL/games/$GAME_ID/start" \
      -H "Content-Type: application/json" \
      -d "{\"questionId\": \"$QUESTION_ID\"}" | jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/games/$GAME_ID/start" \
      -H "Content-Type: application/json" \
      -d "{\"questionId\": \"$QUESTION_ID\"}"
    
    # Test 10: Simulate buzzer press
    echo -e "\n🔔 Simulating buzzer press..."
    curl -s -X POST "$BASE_URL/games/$GAME_ID/buzzer" \
      -H "Content-Type: application/json" \
      -d "{\"teamId\": \"$TEAM1_ID\", \"playerId\": \"player1\"}" | jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/games/$GAME_ID/buzzer" \
      -H "Content-Type: application/json" \
      -d "{\"teamId\": \"$TEAM1_ID\", \"playerId\": \"player1\"}"
    
    # Test 11: Submit correct answer
    echo -e "\n✅ Submitting correct answer..."
    curl -s -X POST "$BASE_URL/games/$GAME_ID/answer" \
      -H "Content-Type: application/json" \
      -d '{"answerIndex": 0, "isCorrect": true}' | jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/games/$GAME_ID/answer" \
      -H "Content-Type: application/json" \
      -d '{"answerIndex": 0, "isCorrect": true}'
  fi
fi

# Test 12: Get settings
echo -e "\n⚙️ Getting settings..."
curl -s -X GET "$BASE_URL/settings" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/settings"

# Test 13: Update settings
echo -e "\n⚙️ Updating settings..."
curl -s -X PUT "$BASE_URL/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "teamSize": 6,
    "maxStrikes": 4,
    "questionTimeLimit": 45
  }' | jq '.' 2>/dev/null || curl -s -X PUT "$BASE_URL/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "teamSize": 6,
    "maxStrikes": 4,
    "questionTimeLimit": 45
  }'

# Test 14: Get leaderboard
echo -e "\n🏅 Getting leaderboard..."
curl -s -X GET "$BASE_URL/leaderboard" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL/leaderboard"

echo -e "\n✅ ALL CURL TESTS COMPLETED!"
echo "=================================="