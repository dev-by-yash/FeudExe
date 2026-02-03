const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/feud-game';

async function testDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define Team schema (same as in models/Team.js)
    const TeamSchema = new mongoose.Schema({
      name: { type: String, required: true, unique: true, trim: true },
      players: [{ name: { type: String, required: true, trim: true }, joinedAt: { type: Date, default: Date.now } }],
      score: { type: Number, default: 0 },
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

    // List all teams
    const teams = await Team.find({});
    console.log('📋 Found teams:');
    teams.forEach(team => {
      console.log(`  - ID: ${team._id}`);
      console.log(`    Name: ${team.name}`);
      console.log(`    Players: ${team.players?.length || 0}`);
      console.log(`    Created: ${team.createdAt}`);
      console.log('');
    });

    if (teams.length === 0) {
      console.log('⚠️  No teams found in database');
      
      // Create a test team
      const testTeam = new Team({
        name: 'Test Team',
        players: []
      });
      
      await testTeam.save();
      console.log('✅ Created test team:', testTeam._id);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDB();