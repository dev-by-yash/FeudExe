# 🔍 DEBUGGING GUIDE - Socket.IO & Team Names

## 🧪 Testing Steps

### Step 1: Test Socket.IO Communication
1. Open browser to `http://localhost:3000/socket-test`
2. Click "Join Game" button
3. Click "Enable Buzzer" button
4. Check Event Logs for:
   - ✅ Connected message
   - ✅ Joined game room message
   - ✅ Buzzer-ready event received
5. Open a second tab to same URL
6. Click "Join Game" in second tab
7. Click "Enable Buzzer" in first tab
8. Check if second tab receives buzzer-ready event

**Expected Result:** Both tabs should show "🟢 BUZZER READY"

---

### Step 2: Test Control Panel Team Names
1. Open `http://localhost:3000/control`
2. Open browser console (F12)
3. Look for logs starting with `📊 Game Response:`
4. Check if team names are present in the response
5. Look for logs starting with `🏷️ Setting team names:`
6. Check if correct names are being set
7. Look for logs starting with `📊 Game State after init:`
8. Check if team names are in the game state

**Expected Logs:**
```
📊 Game Response: {
  gameId: "...",
  teams: [{name: "Team Name 1", ...}, {name: "Team Name 2", ...}],
  teamNames: ["Team Name 1", "Team Name 2"]
}
🏷️ Setting team names for new game: Team Name 1 vs Team Name 2
📊 Game State after init: {
  teamA: {name: "Team Name 1", score: 0, strikes: 0},
  teamB: {name: "Team Name 2", score: 0, strikes: 0}
}
```

---

### Step 3: Test Buzzer Page
1. Open `http://localhost:3000/control?gameId=YOUR_GAME_ID`
2. Open `http://localhost:3000/buzzer?gameId=YOUR_GAME_ID` in new tab
3. In buzzer tab, enter team name and join
4. Open browser console in buzzer tab
5. In control panel, click "Enable Buzzer" button
6. Check buzzer tab console for:
   - ✅ `📡 Joining game room: YOUR_GAME_ID`
   - ✅ `🔔 Received buzzer-ready event!`
7. Check if buzzer button shows "BUZZ NOW!"

**Expected Result:** Buzzer page should show "BUZZ NOW!" message and red button should be enabled

---

### Step 4: Test Multi-Device Sync
1. Open control panel on laptop: `http://localhost:3000/control?gameId=YOUR_GAME_ID`
2. Open buzzer on phone 1: `http://YOUR_IP:3000/buzzer?gameId=YOUR_GAME_ID`
3. Open buzzer on phone 2: `http://YOUR_IP:3000/buzzer?gameId=YOUR_GAME_ID`
4. Enable buzzer in control panel
5. Check if both phones show "BUZZ NOW!"

**Expected Result:** All devices should sync in real-time

---

## 🐛 Common Issues & Solutions

### Issue 1: Buzzer Not Receiving Events
**Symptoms:**
- Buzzer page shows "Waiting for host..." even after enabling
- Console shows "Joined game room" but no "Received buzzer-ready"

**Possible Causes:**
1. **Different game IDs** - Control panel and buzzer using different IDs
2. **Socket not joining room** - join-game event not working
3. **Event not broadcasting** - Server not emitting to room

**Debug Steps:**
```javascript
// In buzzer page console:
console.log('Game ID:', gameId);
console.log('Socket ID:', socket.id);

// In server logs, look for:
Socket XXX joined room [game-YOUR_GAME_ID]
🔔 Buzzer enabled for room [game-YOUR_GAME_ID]
   Room [game-YOUR_GAME_ID] has 2 clients:
      - Socket XXX
      - Socket YYY
```

**Solution:**
- Ensure both pages use same gameId
- Check server logs show both sockets in room
- Verify buzzer-ready event is emitted AFTER both join

---

### Issue 2: Team Names Show "Team A" / "Team B"
**Symptoms:**
- Control panel shows generic names instead of database names
- Scoring display shows "Team A" / "Team B"

**Possible Causes:**
1. **Game not loaded** - currentGame is null
2. **Teams not populated** - teams array doesn't have name field
3. **Scoring engine not updated** - setTeamNames not called

**Debug Steps:**
```javascript
// In control panel console:
console.log('Current Game:', currentGame);
console.log('Teams:', currentGame?.teams);
console.log('Team Names:', currentGame?.teams?.map(t => t.name));
console.log('Game State:', gameState);
console.log('Game State Teams:', gameState?.teams);
```

**Solution:**
- Check if currentGame.teams[0].name exists
- Verify setTeamNames is called with correct names
- Check if gameState.teams.A.name and gameState.teams.B.name are set

---

### Issue 3: Socket Disconnects Frequently
**Symptoms:**
- "Client disconnected" messages in server logs
- Connection status flickers between connected/disconnected

**Possible Causes:**
1. **React strict mode** - Component mounting twice
2. **useEffect dependencies** - Socket recreated on every render
3. **Multiple socket instances** - Creating new socket each time

**Debug Steps:**
```javascript
// Check how many times socket is created:
console.log('Creating socket instance');

// Check useEffect dependencies:
useEffect(() => {
  console.log('Socket useEffect triggered');
  // ...
}, [dependencies]); // Should be empty array []
```

**Solution:**
- Use empty dependency array in useEffect
- Check if socket already exists before creating
- Disable React strict mode in development

---

## 📊 Server Log Analysis

### Good Logs (Working):
```
Socket ABC123 joined room [game-test-123] (gameId: test-123)
Socket DEF456 joined room [game-test-123] (gameId: test-123)
🔔 Buzzer enabled for room [game-test-123]
   Room [game-test-123] has 2 clients:
      - Socket ABC123
      - Socket DEF456
   ✅ Sent buzzer-ready event to 2 clients in room [game-test-123]
```

### Bad Logs (Not Working):
```
Socket ABC123 joined room [game-test-123] (gameId: test-123)
🔔 Buzzer enabled for room [game-test-123]
   Room [game-test-123] has 1 clients:
      - Socket ABC123
   ✅ Sent buzzer-ready event to 1 clients in room [game-test-123]
```
**Problem:** Only 1 client in room when buzzer enabled

---

## 🔧 Quick Fixes

### Fix 1: Ensure Same Game ID
```javascript
// Control Panel
const gameId = searchParams.get('gameId') || localStorage.getItem('currentGameId');

// Buzzer Page
const gameId = searchParams.get('gameId') || 'default-game';

// Make sure both use URL parameter!
```

### Fix 2: Join Room Before Enabling
```javascript
// Buzzer page should join FIRST
useEffect(() => {
  socket.emit('join-game', gameId);
}, [socket, gameId]);

// Then control panel enables buzzer
const enableBuzzer = () => {
  socket.emit('buzzer-ready', gameId);
};
```

### Fix 3: Verify Team Names
```javascript
// After creating game, log the response
console.log('Game created:', gameResponse.game);
console.log('Team 0 name:', gameResponse.game.teams[0]?.name);
console.log('Team 1 name:', gameResponse.game.teams[1]?.name);

// Set team names in scoring engine
scoringEngine.setTeamNames(
  gameResponse.game.teams[0]?.name || 'Team A',
  gameResponse.game.teams[1]?.name || 'Team B'
);
```

---

## ✅ Success Criteria

### Socket.IO Working:
- [ ] Multiple clients can join same game room
- [ ] Buzzer-ready event reaches all clients
- [ ] Events broadcast to all clients in room
- [ ] New clients get current buzzer state

### Team Names Working:
- [ ] Control panel shows database team names
- [ ] Scoring display shows correct names
- [ ] Team names persist across page reloads
- [ ] Team names sync to scoring engine

### Multi-Device Working:
- [ ] Control panel + buzzer page sync
- [ ] Multiple buzzer pages receive events
- [ ] Answer reveals sync across devices
- [ ] Score updates sync in real-time

---

## 📝 Next Steps

1. **Run Socket Test Page** - Verify basic Socket.IO communication
2. **Check Server Logs** - Verify clients joining rooms
3. **Test Buzzer Flow** - Control panel → buzzer page
4. **Verify Team Names** - Check console logs for team data
5. **Test Multi-Device** - Use multiple browsers/devices

---

*Use this guide to systematically debug Socket.IO and team name issues.*
