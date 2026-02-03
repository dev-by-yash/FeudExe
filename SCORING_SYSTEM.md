# 🏆 FEUD.EXE Advanced Scoring System

## 📋 **Overview**

The FEUD.EXE scoring system implements a comprehensive Family Feud-style scoring mechanism with advanced features including round multipliers, streak bonuses, buzzer rewards, and steal mechanics.

---

## 🎯 **Core Scoring Rules**

### **Base Scoring**
- Each correct answer awards its predefined point value
- Wrong answers give 0 points and add 1 strike
- Each answer can only be awarded once per question

### **Strike System**
- Each wrong answer = 1 strike
- Maximum 3 strikes per team per question
- After 3 strikes, control passes to opposing team for steal attempt
- Strikes reset at the start of every new question

---

## 🔢 **Multiplier System**

### **Round Multipliers**
All points are multiplied by the current round multiplier:
- **Round 1**: ×1 (no multiplier)
- **Round 2**: ×2 (double points)
- **Round 3**: ×3 (triple points)

### **Streak Multipliers**
Consecutive correct answers by the same team trigger streak bonuses:
- **1st correct answer**: ×1 (base)
- **2nd correct answer**: ×10
- **3rd correct answer**: ×20
- **4th correct answer**: ×30
- **5th correct answer**: ×40
- **6th correct answer**: ×50 (maximum)

**Streak Reset Conditions:**
- Wrong answer given
- Strike occurs
- Control switches to other team
- Steal attempt occurs
- New question starts

---

## 🎁 **Bonus System**

### **Buzzer Bonus**
- **+10 points** to the team that buzzes first AND gives the first correct answer
- Applied only once per question
- Bonus is multiplied by round multiplier

### **Steal Bonus**
- **+20 points** awarded during successful steal attempts
- Added to all remaining unrevealed answer points
- Applied with round multiplier

### **Perfect Board Bonus**
- **+50 points** for revealing all 6 answers without opponent stealing
- Applied with round multiplier
- Only awarded if no steal attempt was made

---

## 🎯 **Steal Mechanics**

### **Steal Opportunity**
- Triggered when a team reaches 3 strikes
- Opposing team gets ONE steal attempt
- Can choose any unrevealed answer

### **Successful Steal**
- Awards ALL remaining unrevealed answer points
- Adds +20 steal bonus
- Applies round multiplier to total
- Immediately ends the question

### **Failed Steal**
- No points awarded
- Question ends immediately

---

## 📊 **Score Calculation Order**

For every correct answer, score is calculated in this exact order:

1. **Base Points**: Answer's predefined point value
2. **Round Multiplier**: Multiply by current round (×1, ×2, or ×3)
3. **Streak Multiplier**: Apply streak bonus (×1 to ×50)
4. **Buzzer Bonus**: Add +10 if applicable (also multiplied by round)
5. **Steal Bonus**: Add +20 if steal attempt (also multiplied by round)
6. **Perfect Board Bonus**: Add +50 if all answers revealed (also multiplied by round)

### **Example Calculation**
```
Base Answer: 25 points
Round 2: ×2 = 50 points
3rd Streak: ×20 = 1,000 points
Buzzer Bonus: +10 ×2 = +20 points
Total: 1,020 points
```

---

## 🎮 **Game Flow Integration**

### **Question Start**
- Reset all strikes to 0
- Reset streak counter
- Clear buzzer bonus flag
- Initialize answer reveal tracking

### **Buzzer Press**
- Set buzzer bonus flag for first correct answer
- Switch current team control
- Enable answer processing

### **Answer Processing**
- Check if answer already revealed
- Calculate score with all multipliers
- Update team scores
- Update streak counters
- Check for perfect board bonus

### **Strike Out (3 Strikes)**
- Switch control to opposing team
- Enable steal opportunity
- Disable normal answer processing

### **Question End**
- Reset all question-specific states
- Update game statistics
- Prepare for next question

---

## 🛠 **Technical Implementation**

### **ScoringEngine Class**
```javascript
import { scoringEngine } from './lib/scoring.js';

// Initialize new question
scoringEngine.startNewQuestion(answers, startingTeam);

// Handle buzzer press
scoringEngine.handleBuzzer(teamId);

// Process correct answer
scoringEngine.processCorrectAnswer(answerIndex, points, teamId);

// Process wrong answer
scoringEngine.processWrongAnswer(teamId);

// Handle steal attempt
scoringEngine.processStealAttempt(isCorrect, answerIndex, points);
```

### **Helper Functions**
```javascript
import { scoringHelpers } from './lib/scoring.js';

// Process answer reveal from host
scoringHelpers.processAnswerReveal(answerIndex, answer, isCorrect, teamId);

// Handle buzzer with team info
scoringHelpers.handleBuzzerPress(teamId, teamName);

// Get formatted scores
scoringHelpers.getFormattedScores();
```

---

## 🎛️ **Host Controls**

### **Answer Reveal Controls**
- Numpad 1-6: Reveal corresponding answers as correct
- X key: Mark answer as wrong (add strike)
- Visual feedback for revealed answers

### **Buzzer Controls**
- B key: Enable buzzer system
- R key: Reset buzzer state
- Automatic buzzer bonus tracking

### **Steal Controls**
- Automatic steal opportunity detection
- Manual steal attempt processing
- Remaining points calculation

### **Score Management**
- Real-time score updates
- Manual score adjustments
- Score breakdown display

---

## 📈 **Statistics Tracking**

### **Game Statistics**
- Total questions played
- Questions completed
- Total answers revealed
- Steals attempted vs successful
- Perfect boards achieved

### **Team Statistics**
- Individual team scores
- Strike counts
- Streak achievements
- Bonus points earned

---

## 🎨 **UI Components**

### **ScoringDisplay Component**
- Live team scores with formatting
- Round and streak multiplier display
- Strike indicators
- Bonus information

### **HostScoringControls Component**
- Answer reveal buttons
- Team control switches
- Steal attempt management
- Score adjustment tools

---

## 🔧 **Configuration Options**

### **Customizable Settings**
```javascript
// Round multipliers
roundMultipliers: { 1: 1, 2: 2, 3: 3 }

// Streak multipliers
streakMultipliers: { 1: 1, 2: 10, 3: 20, 4: 30, 5: 40, 6: 50 }

// Bonus points
bonuses: { buzzer: 10, steal: 20, perfectBoard: 50 }
```

### **Game Settings**
- Maximum strikes per team (default: 3)
- Question time limits
- Buzzer time limits
- Team size limits

---

## 🎯 **Strategic Elements**

### **Risk vs Reward**
- Higher streaks = higher multipliers but higher risk
- Buzzer timing becomes crucial for bonus points
- Steal attempts can dramatically change scores

### **Momentum Shifts**
- Streak system rewards consecutive success
- Strike system creates tension and opportunities
- Round multipliers increase stakes over time

### **Host Strategy**
- Control pacing with buzzer management
- Create dramatic moments with steal opportunities
- Balance difficulty with answer reveals

---

## 🚀 **Advanced Features**

### **Real-time Updates**
- Socket.IO integration for live score updates
- Instant feedback on all scoring actions
- Synchronized state across all clients

### **Score Breakdown**
- Detailed calculation display
- Historical score tracking
- Performance analytics

### **Accessibility**
- Keyboard shortcuts for all controls
- Visual indicators for all states
- Clear audio/visual feedback

---

## 📊 **Example Game Scenario**

```
Round 2 (×2 multiplier)
Team A has 2-answer streak (×20 multiplier)
Team A buzzes first (+10 bonus)
Answer worth 30 points

Calculation:
Base: 30 points
Round: 30 × 2 = 60 points  
Streak: 60 × 20 = 1,200 points
Buzzer: +10 × 2 = +20 points
Total: 1,220 points awarded to Team A
```

---

## 🎮 **Integration with Game Flow**

### **Database Integration**
- Persistent score storage
- Game state management
- Historical data tracking

### **Socket.IO Events**
- Real-time score broadcasting
- Buzzer press handling
- Game state synchronization

### **API Endpoints**
- Score update endpoints
- Game state management
- Statistics retrieval

---

## 🏆 **Competitive Balance**

### **Comeback Mechanics**
- Steal opportunities provide dramatic reversals
- Round multipliers increase late-game stakes
- Perfect board bonuses reward complete knowledge

### **Skill vs Luck**
- Buzzer timing rewards quick thinking
- Streak system rewards consistent knowledge
- Steal mechanics add strategic depth

### **Spectator Engagement**
- Clear visual feedback on all scoring
- Dramatic score swings keep audience engaged
- Transparent calculation builds trust

---

## 📝 **Usage Examples**

### **Basic Game Setup**
```javascript
// Start new game
scoringEngine.resetGame();
scoringEngine.setTeamNames("Lightning Bolts", "Thunder Hawks");
scoringEngine.startNewRound(1);

// Start question
scoringEngine.startNewQuestion(questionAnswers, 'A');
```

### **Handle Gameplay**
```javascript
// Buzzer press
scoringEngine.handleBuzzer('A');

// Correct answer
const result = scoringEngine.processCorrectAnswer(0, 25, 'A');
console.log(`Team A scored ${result.scoreCalculation.totalScore} points!`);

// Wrong answer
scoringEngine.processWrongAnswer('A');

// Steal attempt
scoringEngine.processStealAttempt(true, 2, 15);
```

---

## 🎯 **Best Practices**

### **For Hosts**
- Use keyboard shortcuts for quick control
- Monitor streak counters for dramatic moments
- Time steal opportunities for maximum impact

### **For Developers**
- Always validate answer indices
- Handle edge cases (all answers revealed, etc.)
- Maintain state consistency across components

### **For Players**
- Understand multiplier system for strategy
- Time buzzer presses carefully
- Consider risk/reward of consecutive answers

---

**The FEUD.EXE scoring system creates an engaging, fair, and exciting competitive experience that rewards skill, timing, and strategic thinking while maintaining the classic Family Feud gameplay that audiences love!** 🎉