# 🔍 Teams Not Showing Up - Troubleshooting Guide

## Issue: "I don't see any teams after start game where all the teams go"

This guide will help you diagnose and fix the missing teams issue step by step.

---

## 🚀 **Quick Fix Steps**

### Step 1: Check if Teams Exist
1. Go to the **Debug page** (now available on homepage)
2. Click the **Debug** button on the homepage
3. Check if any teams are listed in the "Teams" section

### Step 2: Create Teams if Missing
If no teams are found:
1. Go to **Setup Teams** page
2. Create at least 2 teams
3. Add players to each team
4. Return to **Play Game** page

### Step 3: Test Database Connection
1. On the **Debug page**, click "Test Teams API"
2. Check browser console for any error messages
3. Verify MongoDB is running locally

---

## 🔧 **Detailed Troubleshooting**

### Check 1: MongoDB Database
```bash
# Make sure MongoDB is running
mongosh mongodb://localhost:27017/feud-game

# Check if teams collection exists
use feud-game
db.teams.find()
```

### Check 2: Environment Configuration
Verify `.env.local` contains:
```
MONGODB_URI=mongodb://localhost:27017/feud-game
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Check 3: API Response
1. Open browser developer tools (F12)
2. Go to **Play Game** page
3. Click "Test API" button in the debug section
4. Check console for API response

### Check 4: Network Tab
1. Open developer tools → Network tab
2. Refresh **Play Game** page
3. Look for `/api/teams` request
4. Check if it returns 200 status and team data

---

## 🎯 **Common Issues & Solutions**

### Issue: "No teams found" message
**Solution:** Create teams first
1. Go to `/setup` page
2. Create 2+ teams with players
3. Return to `/game` page

### Issue: API errors in console
**Solution:** Check MongoDB connection
1. Ensure MongoDB is running: `mongod`
2. Check connection string in `.env.local`
3. Restart development server: `npm run dev`

### Issue: Teams exist but don't show in game
**Solution:** Clear browser cache
1. Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache and cookies
3. Restart browser

### Issue: Database connection errors
**Solution:** Restart services
```bash
# Stop development server
Ctrl+C

# Restart MongoDB (if needed)
mongod

# Restart development server
npm run dev
```

---

## 🔍 **Debug Tools Available**

### 1. Debug Page (`/debug`)
- Shows all teams and questions in database
- Tests API connectivity
- Displays database status

### 2. Game Page Debug Section
- "Refresh Teams" button
- "Test API" button  
- Direct link to debug page
- Console logging for API calls

### 3. Browser Developer Tools
- Console tab: Shows API calls and errors
- Network tab: Shows HTTP requests/responses
- Application tab: Shows local storage

---

## 📋 **Step-by-Step Verification**

### ✅ **Checklist**
- [ ] MongoDB is running locally
- [ ] `.env.local` file exists with correct settings
- [ ] Development server is running (`npm run dev`)
- [ ] At least 2 teams exist in database
- [ ] Teams have players added
- [ ] No console errors when loading game page
- [ ] API test returns team data

### 🎯 **Expected Results**
When working correctly:
- Debug page shows teams count > 0
- Game setup page shows team selection checkboxes
- Console shows "Successfully loaded X teams"
- No error messages in red boxes

---

## 🚨 **If Still Not Working**

### Last Resort Steps:
1. **Clear all data and restart:**
   ```bash
   # Stop server
   Ctrl+C
   
   # Clear MongoDB database
   mongosh mongodb://localhost:27017/feud-game
   db.dropDatabase()
   
   # Restart server
   npm run dev
   
   # Import sample data
   npm run import-sample
   ```

2. **Check server logs:**
   - Look at terminal where `npm run dev` is running
   - Check for any error messages
   - Verify Socket.IO server initialized

3. **Test with sample data:**
   ```bash
   npm run import-sample
   ```

---

## 📞 **Getting Help**

If teams still don't show up after following this guide:

1. **Share debug information:**
   - Screenshot of debug page
   - Console error messages
   - Network tab showing API calls

2. **Provide system info:**
   - Operating system
   - Node.js version: `node --version`
   - MongoDB version: `mongod --version`

3. **Test basic functionality:**
   - Can you create teams in `/setup`?
   - Do teams appear in `/debug`?
   - Does API test button work?

---

**Most Common Solution:** Create teams first in Setup Teams page, then return to Play Game page!