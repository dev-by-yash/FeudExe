const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feud-game';

// Team schema (same as in models/Team.js)
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

const Team = mongoose.model('Team', TeamSchema);

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
  }
];

async function createSampleTeams() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log(`Creating ${sampleTeams.length} sample teams...`);

    let created = 0;
    let skipped = 0;

    for (const teamData of sampleTeams) {
      try {
        // Check if team already exists
        const existingTeam = await Team.findOne({ name: teamData.name });

        if (existingTeam) {
          console.log(`Team already exists: ${teamData.name}`);
          skipped++;
          continue;
        }

        // Create new team
        const team = new Team({
          name: teamData.name,
          players: teamData.players,
          score: 0,
          gamesPlayed: 0,
          gamesWon: 0
        });

        await team.save();
        created++;
        console.log(`Created team: ${teamData.name} (${teamData.players.length} players)`);
      } catch (error) {
        console.error(`Error creating team "${teamData.name}":`, error.message);
        skipped++;
      }
    }

    console.log(`\nTeam creation completed:`);
    console.log(`- Created: ${created} teams`);
    console.log(`- Skipped: ${skipped} teams`);

    // Show all teams
    const allTeams = await Team.find({});
    console.log(`\nTotal teams in database: ${allTeams.length}`);
    allTeams.forEach(team => {
      console.log(`- ${team.name}: ${team.players.length} players`);
    });

  } catch (error) {
    console.error('Team creation failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Usage
if (require.main === module) {
  createSampleTeams();
}

module.exports = { createSampleTeams };