# Socket.IO Server Setup Guide

## ⚠️ **IMPORTANT: Socket.IO Server Required**

The Family Feud game requires Socket.IO for real-time synchronization between the control panel and game page. You **MUST** run the custom server with Socket.IO support.

## 🚀 **How to Start the Server**

### **Method 1: Default Development Server (Recommended)**
```bash
npm run dev
```
This now runs the Socket.IO server by default.

### **Method 2: Explicit Socket.IO Server**
```bash
npm run dev-socket
```

### **Method 3: Production Server**
```bash
npm run start
```

## ❌ **Don't Use This**
```bash
npm run dev-next
```
This runs Next.js without Socket.IO and will cause 404 errors for Socket.IO connections.

## 🔍 **How to Verify Socket.IO is Working**

### **1. Check Server Logs**
When you start the server, you should see:
```
> Ready on http://localhost:3000
> Socket.IO server initialized
```

### **2. Check Browser Console**
Open the game page and check the browser console. You should see:
```
Connected to server
Socket 12345 joined game default-game
```

### **3. Test Real-time Sync**
1. Open Control Panel: `http://localhost:3000/control`
2. Open Game Page: `http://localhost:3000/game` (in different tab)
3. Reveal answers in Control Panel
4. Check if answers appear immediately in Game Page

## 🐛 **Troubleshooting Socket.IO Issues**

### **404 Errors for socket.io**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
socket.io?EIO=4&transport=polling&t=fe22xvqf:1
```

**Solution:** You're running the wrong server. Stop the current server and run:
```bash
npm run dev
```

### **Connection Refused**
```
WebSocket connection to 'ws://localhost:3000/socket.io/' failed
```

**Solutions:**
1. Make sure the server is running with Socket.IO support
2. Check if port 3000 is available
3. Try restarting the server

### **No Real-time Updates**
If changes in Control Panel don't appear in Game Page:

1. **Check Connection Status**
   - Control Panel should show "🟢 Connected"
   - Game Page should show "🟢 Synced with Control Panel"

2. **Check Browser Console**
   - Look for Socket.IO connection messages
   - Check for any JavaScript errors

3. **Manual Sync**
   - Click "Sync Now" button in Game Page
   - Refresh both pages

## 🔧 **Server Configuration**

### **Port Configuration**
Default port is 3000. To change:
```bash
PORT=3001 npm run dev
```

### **CORS Configuration**
The server is configured for development with:
```javascript
cors: {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"]
}
```

## 📋 **Socket.IO Events**

The server handles these events:

### **Game Management**
- `join-game` - Join a game room
- `leave-game` - Leave a game room
- `game-update` - Update game state

### **Buzzer System**
- `buzzer-press` - Team buzzer press
- `buzzer-ready` - Enable buzzer
- `buzzer-reset` - Reset buzzer

### **Answer System**
- `reveal-answer` - Reveal an answer
- `add-strike` - Add strike to team

### **Real-time Sync**
- `game-state-updated` - Broadcast game changes
- `answer-revealed` - Broadcast answer reveals

## ✅ **Quick Start Checklist**

1. ✅ Stop any running Next.js server
2. ✅ Run `npm run dev` (Socket.IO server)
3. ✅ Check server logs for "Socket.IO server initialized"
4. ✅ Open Control Panel: `http://localhost:3000/control`
5. ✅ Open Game Page: `http://localhost:3000/game`
6. ✅ Verify connection status shows "Connected"
7. ✅ Test real-time sync by revealing answers

## 🎮 **Game Flow with Socket.IO**

1. **Setup**: Select teams on main page
2. **Control Panel**: Host opens `/control` for game management
3. **Game Display**: Open `/game` for clean player view
4. **Real-time Sync**: All changes in Control Panel instantly appear in Game Page
5. **Buzzer System**: Teams use `/buzzer` for buzzer competition

The Socket.IO server enables seamless real-time communication between all components!