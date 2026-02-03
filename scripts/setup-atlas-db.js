const mongoose = require('mongoose');

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yashm13114:sh5VlCTZNnkShVVP@cluster0.lgqyj4p.mongodb.net/feudExe';

// Team schema
const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  players: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  gamesWon: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TeamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Question schema
const QuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answers: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    points: {
      type: Number,
      required: true,
      min: 1
    },
    revealed: {
      type: Boolean,
      default: false
    }
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

QuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.totalPoints = this.answers.reduce((sum, answer) => sum + answer.points, 0);
  next();
});

const Team = mongoose.model('Team', TeamSchema);
const Question = mongoose.model('Question', QuestionSchema);

// Sample teams data
const sampleTeams = [
  {
    name: "Lightning Bolts",
    players: [
      { name: "Alex Johnson" },
      { name: "Sarah Chen" },
      { name: "Mike Rodriguez" },
      { name: "Emma Wilson" }
    ]
  },
  {
    name: "Thunder Hawks",
    players: [
      { name: "David Kim" },
      { name: "Lisa Thompson" },
      { name: "Ryan O'Connor" },
      { name: "Maya Patel" }
    ]
  },
  {
    name: "Fire Dragons",
    players: [
      { name: "Chris Anderson" },
      { name: "Jessica Lee" },
      { name: "Marcus Brown" },
      { name: "Zoe Martinez" }
    ]
  },
  {
    name: "Ice Wolves",
    players: [
      { name: "Tyler Davis" },
      { name: "Amanda Garcia" },
      { name: "Kevin Zhang" },
      { name: "Sophia Taylor" }
    ]
  },
  {
    name: "Storm Eagles",
    players: [
      { name: "Brandon Smith" },
      { name: "Rachel Green" },
      { name: "Jordan White" },
      { name: "Ashley Brown" }
    ]
  },
  {
    name: "Blazing Phoenix",
    players: [
      { name: "Nathan Clark" },
      { name: "Olivia Jones" },
      { name: "Ethan Miller" },
      { name: "Chloe Davis" }
    ]
  }
];

// Load questions from JSON file
const fs = require('fs');
const path = require('path');

async function setupAtlasDatabase() {
  try {
    console.log('🚀 Setting up MongoDB Atlas database...');
    console.log('Connection URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await Team.deleteMany({});
    await Question.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create teams
    console.log('👥 Creating sample teams...');
    let teamsCreated = 0;
    
    for (const teamData of sampleTeams) {
      try {
        const team = new Team({
          name: teamData.name,
          players: teamData.players,
          score: 0,
          gamesPlayed: 0,
          gamesWon: 0
        });

        await team.save();
        teamsCreated++;
        console.log(`   ✅ Created team: ${teamData.name} (${teamData.players.length} players)`);
      } catch (error) {
        console.error(`   ❌ Error creating team "${teamData.name}":`, error.message);
      }
    }

    // Load and create questions
    console.log('❓ Loading questions from expanded-questions.json...');
    const questionsPath = path.join(__dirname, 'expanded-questions.json');
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    
    let questionsCreated = 0;
    
    for (const questionData of questionsData) {
      try {
        const question = new Question({
          category: questionData.category.trim(),
          question: questionData.question.trim(),
          answers: questionData.answers.map(answer => ({
            text: answer.text.trim(),
            points: answer.points,
            revealed: false
          })),
          difficulty: questionData.difficulty || 'medium',
          isActive: questionData.isActive !== false
        });

        await question.save();
        questionsCreated++;
        console.log(`   ✅ Created question: ${questionData.question.substring(0, 50)}...`);
      } catch (error) {
        console.error(`   ❌ Error creating question "${questionData.question}":`, error.message);
      }
    }

    // Summary
    console.log('\n🎉 Database setup completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Teams created: ${teamsCreated}`);
    console.log(`   - Questions created: ${questionsCreated}`);

    // Verify data
    const totalTeams = await Team.countDocuments();
    const totalQuestions = await Question.countDocuments();
    
    console.log(`\n✅ Verification:`);
    console.log(`   - Total teams in database: ${totalTeams}`);
    console.log(`   - Total questions in database: ${totalQuestions}`);

    // Show teams
    const allTeams = await Team.find({});
    console.log(`\n👥 Teams in database:`);
    allTeams.forEach(team => {
      console.log(`   - ${team.name}: ${team.players.length} players`);
    });

    // Show question categories
    const categories = await Question.distinct('category');
    console.log(`\n📚 Question categories:`);
    for (const category of categories) {
      const count = await Question.countDocuments({ category });
      console.log(`   - ${category}: ${count} questions`);
    }

    console.log('\n🎮 Your FEUD.EXE database is ready!');
    console.log('🚀 Start your application with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Run the setup
if (require.main === module) {
  setupAtlasDatabase();
}

module.exports = { setupAtlasDatabase };