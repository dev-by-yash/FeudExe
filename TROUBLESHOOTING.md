# 🔧 Troubleshooting: "Team not found" Error

## 🚨 Issue
When adding a player to a team, you get the error: "Team not found"

## 🔍 Debugging Steps

### Step 1: Test Database Connection
```bash
npm run test-db
```
This will show you:
- If MongoDB is connected
- What teams exist in the database
- Their IDs and structure

### Step 2: Check Server Logs
When you try to add a player, check the terminal where your server is running. You should see logs like:
```
Adding player to team: { teamId: '...', playerName: '...' }
Found team: TeamName
Player added successfully
```

### Step 3: Test API Directly
Open your browser and go to:
```
http://localhost:3000/api/debug/teams
```
This will show you all teams and their IDs.

### Step 4: Verify Team IDs
In the browser console (F12), when you try to add a player, check what's being sent:
```javascript
// You should see logs like:
Adding player: { playerName: "yash mehta", selectedTeam: "675a1234567890abcdef1234" }
```

## 🛠️ Quick Fixes

### Fix 1: Restart with Standard Next.js Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```
Instead of the custom Socket.IO server, use standard Next.js dev server first.

### Fix 2: Clear and Recreate Teams
If teams exist but have wrong IDs:
1. Go to Setup Teams page
2. Delete all existing teams (🗑️ button)
3. Create new teams
4. Try adding players again

### Fix 3: Check MongoDB
Make sure MongoDB is running:
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or start it
sudo systemctl start mongod

# Or if using direct MongoDB
mongod --dbpath /path/to/your/db
```

### Fix 4: Reset Database
If all else fails, reset the database:
```bash
# Connect to MongoDB
mongo
use feud-game
db.teams.drop()
exit
```
Then recreate teams.

## 🔧 Manual Fix

If the issue persists, here's a manual fix for the API route:

1. **Check the team ID format** - Make sure it's a valid MongoDB ObjectId
2. **Verify the API route path** - Should be `/api/teams/[id]/players`
3. **Check database connection** - Make sure MongoDB is connected

## 🚀 Alternative: Use Standard Development

For now, you can use the standard Next.js development server:

```bash
# Use this instead of npm run dev
npm run dev

# Socket.IO features won't work, but basic team management will
```

## 📋 Expected Behavior

When working correctly:
1. You select a team from dropdown
2. Enter player name
3. Click "Add Player"
4. Player appears in the team card below
5. No errors in console

## 🆘 If Still Not Working

1. **Check browser console** (F12) for JavaScript errors
2. **Check server terminal** for API errors
3. **Verify MongoDB is running** and accessible
4. **Try creating a new team** and adding players to it
5. **Check network tab** in browser dev tools to see the actual API calls

The most likely cause is either:
- MongoDB not running
- Team ID format issue
- Server not properly handling the API route

Run the debugging steps above to identify the exact issue!