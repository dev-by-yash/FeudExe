/**
 * Cleanup Script - Remove old games from database
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yashm13114:sh5VlCTZNnkShVVP@cluster0.lgqyj4p.mongodb.net/feudExe';

async function cleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Collections found:', collections.map(c => c.name).join(', '));

    // Clear Games collection
    if (collections.find(c => c.name === 'games')) {
      const result = await mongoose.connection.db.collection('games').deleteMany({});
      console.log(`\n🗑️  Deleted ${result.deletedCount} games from 'games' collection`);
    }

    // Clear ActiveGames collection
    if (collections.find(c => c.name === 'activegames')) {
      const result = await mongoose.connection.db.collection('activegames').deleteMany({});
      console.log(`🗑️  Deleted ${result.deletedCount} games from 'activegames' collection`);
    }

    console.log('\n✅ Cleanup complete!');
    console.log('You can now start fresh games.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanup();
