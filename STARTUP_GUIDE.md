# 🎮 FEUD.EXE - Complete Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
Make sure MongoDB is running locally:
```bash
# If using MongoDB service
sudo systemctl start mongod

# Or if using MongoDB directly
mongod --dbpath /path/to/your/db
```

### 3. Import Sample Questions
```bash
npm run import-sample
```

### 4. Start the Application
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

---

## 🎯 Complete Integration Overview

### ✅ What's Working Now:

#### **Frontend & Backend Integration**
- **Homepage**: Beautiful landing page with FEUD.EXE logo
- **Team Management**: Create teams, add/remove players (connected to MongoDB)
- **Question System**: Import questions from JSON, manage categories
- **Game Engine**: Full game flow with real-time updates
- **Buzzer System**: Real-time multiplayer buzzer with Socket.IO
- **Leaderboard**: Live team rankings and statistics
- **Control Panel**: Host controls for managing games

#### **Real-time Features**
- **Socket.IO Integration**: Custom server with real-time communication
- **Buzzer Competition**: Multiple players can compete simultaneously
- **Live Updates**: Game state synchronization across all clients
- **Instant Feedback**: Winner determination and notifications

#### **Database Integration**
- **MongoDB**: All data persisted to database
- **API Routes**: Complete REST API for all operations
- **Data Models**: Teams, Questions, Games, Settings
- **Real-time Sync**: Frontend automatically updates from backend

---

## 🎮 How to Use the System

### **Step 1: Setup Teams**
1. Go to **Setup Teams** from homepage
2. Create teams and add players
3. Teams are saved to MongoDB automatically

### **Step 2: Manage Questions**
1. Go to **Questions** from homepage
2. Import questions from JSON or manage existing ones
3. Questions are categorized and stored in database

### **Step 3: Start a Game**
1. Go to **Play Game** from homepage
2. Select teams and questions
3. Create and start the game

### **Step 4: Use Buzzer System**
1. Go to **Control Panel** for host controls
2. Share buzzer link with players
3. Players join with their names and teams
4. Enable buzzer when ready for competition

### **Step 5: Game Flow**
1. Host enables buzzer
2. Players compete to buzz first
3. Host reveals answers using numpad (1-6)
4. Scores update automatically
5. Leaderboard shows live rankings

---

## 🔧 Technical Architecture

### **Frontend (Next.js)**
- **React Components**: Modern, responsive UI
- **Tailwind CSS**: Beautiful glassmorphism design
- **Socket.IO Client**: Real-time communication
- **API Integration**: Connects to backend APIs

### **Backend (Node.js + Next.js API)**
- **MongoDB**: Database with Mongoose ODM
- **Socket.IO Server**: Real-time event handling
- **REST APIs**: Complete CRUD operations
- **Custom Server**: Integrated Socket.IO with Next.js

### **Real-time System**
- **Game Rooms**: Players join specific game sessions
- **Event Broadcasting**: Updates sent to all participants
- **Buzzer Logic**: Timestamp-based winner determination
- **State Synchronization**: All clients stay in sync

---

## 🎯 Key Features

### **🏆 Team Management**
- Create unlimited teams
- Add/remove players dynamically
- Track scores and game statistics
- Persistent storage in MongoDB

### **❓ Question System**
- Import questions from JSON files
- Categorize by topic/difficulty
- Multiple answers with point values
- Easy management interface

### **🔔 Buzzer System**
- Real-time multiplayer competition
- Keyboard and touch support
- Visual feedback and animations
- Automatic winner determination

### **🎮 Game Engine**
- Complete game flow management
- Timer system with customizable limits
- Strike tracking (3 strikes rule)
- Score calculation and updates

### **📊 Live Leaderboard**
- Real-time team rankings
- Game statistics and history
- Win/loss tracking
- Performance metrics

### **🎛️ Host Controls**
- Enable/disable buzzer
- Reveal answers with numpad
- Manage game state
- Share player links

---

## 🌐 URLs and Navigation

### **Main Pages**
- **Homepage**: `/` - Landing page with navigation
- **Play Game**: `/game` - Main game interface
- **Setup Teams**: `/setup` - Team management
- **Questions**: `/question` - Question management
- **Leaderboard**: `/leaderboard` - Team rankings
- **Control Panel**: `/control` - Host controls
- **Buzzer**: `/buzzer?gameId=xxx` - Player buzzer interface

### **API Endpoints**
- **Teams**: `/api/teams` - Team CRUD operations
- **Questions**: `/api/questions` - Question management
- **Games**: `/api/games` - Game operations
- **Settings**: `/api/settings` - Configuration
- **Leaderboard**: `/api/leaderboard` - Rankings

---

## 🔧 Configuration

### **Environment Variables**
```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/feud-game
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Game Settings**
- **Team Size**: Configurable (default: 4 players)
- **Max Strikes**: Configurable (default: 3)
- **Question Time**: Configurable (default: 30 seconds)
- **Buzzer Time**: Configurable (default: 5 seconds)

---

## 🎮 Keyboard Controls

### **Host Controls**
- **1-6**: Reveal answers
- **X**: Add strike
- **Space**: Start timer
- **B**: Enable buzzer
- **R**: Reset buzzer

### **Player Controls**
- **Space**: Press buzzer

---

## 🚀 Production Deployment

### **Build for Production**
```bash
npm run build
npm start
```

### **Environment Setup**
- Set `NODE_ENV=production`
- Configure MongoDB connection
- Set proper CORS origins
- Enable SSL/HTTPS

---

## 🎯 What Makes This Special

### **🔥 Real-time Competition**
- Multiple players can compete simultaneously
- Instant winner determination
- Live feedback and animations
- No lag or delays

### **🎨 Modern UI/UX**
- Glassmorphism design
- Smooth animations
- Responsive layout
- Professional appearance

### **⚡ Performance**
- Optimized Socket.IO communication
- Efficient database queries
- Fast page loads
- Smooth real-time updates

### **🔧 Scalability**
- Room-based architecture
- Multiple concurrent games
- Database-backed persistence
- Easy to extend

---

## 🎮 Ready to Play!

Your FEUD.EXE system is now fully integrated and ready for competitive team battles! 

**Start with**: `npm run dev` and visit **http://localhost:3000**

The system combines the best of modern web technology with classic game show excitement. Players get instant feedback, hosts have full control, and everyone enjoys a smooth, professional experience.

**Let the feuding begin!** 🎉