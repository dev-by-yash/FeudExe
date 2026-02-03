# 🚀 Quick Start Guide - New Game Code System

## What's New?

The system now uses **simple game codes** (like "ABC123") instead of complex MongoDB IDs. This makes it much easier to join games and sync across devices.

## Step-by-Step Testing

### 1. Start the Server
```bash
npm run dev
```

Wait for: `> Ready on http://localhost:3000`

### 2. Open Start Game Page
Navigate to: **http://localhost:3000/start-game**

You'll see two options:
- **Create New Game** - Click this to generate a random game code
- **Join Existing Game** - Enter a code if you already have one

### 3. Create a New Game
Click **"Create New Game"**

You'll be redirected to the control panel with a URL like:
```
http://localhost:3000/control?gameCode=ABC123
```

The game code (e.g., "ABC123") is shown in:
- The URL
- The debug info section
- The "Player Buzzer Access" section at the bottom

### 4. Open Buzzer Pages (2 separate windows/tabs)

**Window 1 - Team 1:**
1. Open: `http://localhost:3000/buzzer?gameCode=ABC123` (use your actual game code)
2. Enter team name: **"Ice Wolves"**
3. Click **"Join Game"**
4. You should see: "Waiting for host..."

**Window 2 - Team 2:**
1. Open: `http://localhost:3000/buzzer?gameCode=ABC123` (same game code!)
2. Enter team name: **"Storm Eagles"**
3. Click **"Join Game"**
4. You should see: "Waiting for host..."

### 5. Check Control Panel
In the control panel, look at the debug info section:
- **Buzzer Teams: Connected: 2** (should show 2 teams)
- You should see: 🔔 Ice Wolves
- You should see: 🔔 Storm Eagles

### 6. Enable Buzzer
In the control panel:
- Click **"🔔 Enable Buzzer"** button (or press `B` key)

### 7. Watch Buzzer Pages
Both buzzer windows should now show:
- **"BUZZ NOW!"** message
- Red BUZZ button becomes active

### 8. Press Buzzer
In one of the buzzer windows:
- Click the **BUZZ** button (or press SPACE)

### 9. Check Results
**In Control Panel:**
- Should show: "🏆 Buzzer Winner! [Team Name]"
- Team name should match the buzzer input (Ice Wolves or Storm Eagles)

**In Buzzer Windows:**
- Winner sees: "🎉 YOU BUZZED FIRST! 🎉"
- Loser sees: "❌ [Winner] buzzed first!"

## Troubleshooting

### Problem: Buzzer pages show "🔴 Disconnected"
**Solution:**
1. Check if server is running (`npm run dev`)
2. Refresh the buzzer page
3. Check browser console for errors

### Problem: Teams not showing in control panel
**Solution:**
1. Make sure all pages use the **same game code**
2. Check the URL - it should be `?gameCode=ABC123` (not `?gameId=...`)
3. Refresh all pages

### Problem: "BUZZ NOW!" doesn't appear
**Solution:**
1. Check Socket.IO connection (should show 🟢 Connected)
2. Verify all pages are in the same game room
3. Check server logs for room membership

### Problem: Team names wrong (showing Fire Dragons, Blazing Phoenix)
**Solution:**
1. Run cleanup script: `node scripts/cleanup-games.js`
2. Refresh all pages
3. Create a new game with a new code

## Server Logs to Watch

When everything works correctly, you should see:

```
Socket [id] joined room [game-ABC123] (gameCode: ABC123)
Socket [id] joined room [game-ABC123] (gameCode: ABC123)
Socket [id] joined room [game-ABC123] (gameCode: ABC123)
🔔 Buzzer enabled for room [game-ABC123] (gameCode: ABC123)
   Room [game-ABC123] has 3 clients:
      - Socket [id1]
      - Socket [id2]
      - Socket [id3]
   ✅ Sent buzzer-ready event to 3 clients in room [game-ABC123]
Buzzer pressed in game ABC123 by Ice Wolves from team Ice Wolves
```

## Success Checklist

- [ ] Server starts without errors
- [ ] Can create new game with code
- [ ] Control panel shows game code in URL
- [ ] Can open 2 buzzer pages with same code
- [ ] Both buzzers show "🟢 Connected"
- [ ] Control panel shows 2 teams connected
- [ ] Team names match buzzer input (Ice Wolves, Storm Eagles)
- [ ] Enable buzzer works
- [ ] Both buzzers show "BUZZ NOW!"
- [ ] Pressing buzzer shows winner
- [ ] Winner name matches buzzer input

## Next Steps

Once basic buzzer flow works:
1. Test answer reveals
2. Test scoring system
3. Test multiple rounds
4. Test game completion

## Quick Commands

```bash
# Start server
npm run dev

# Clean database
node scripts/cleanup-games.js

# Check logs
# Watch the terminal where npm run dev is running
```

## URLs to Bookmark

- Start Game: http://localhost:3000/start-game
- Control Panel: http://localhost:3000/control?gameCode=YOUR_CODE
- Buzzer: http://localhost:3000/buzzer?gameCode=YOUR_CODE

---

**Remember:** All pages must use the **same game code** to be in the same Socket.IO room!
