import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Team from '../../../models/Team';
import Question from '../../../models/Question';
import Game from '../../../models/Game';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test MongoDB connection
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Test collections
    const teamsCount = await Team.countDocuments();
    const questionsCount = await Question.countDocuments();
    const gamesCount = await Game.countDocuments();

    console.log(`📊 Database stats:
    - Teams: ${teamsCount}
    - Questions: ${questionsCount}
    - Games: ${gamesCount}`);

    // Test sample data
    const sampleTeam = await Team.findOne();
    const sampleQuestion = await Question.findOne();

    const result = {
      success: true,
      connection: 'Connected to MongoDB Atlas',
      database: 'feudExe',
      collections: {
        teams: {
          count: teamsCount,
          sample: sampleTeam ? {
            id: sampleTeam._id,
            name: sampleTeam.name,
            players: sampleTeam.players?.length || 0
          } : null
        },
        questions: {
          count: questionsCount,
          sample: sampleQuestion ? {
            id: sampleQuestion._id,
            question: sampleQuestion.question,
            category: sampleQuestion.category,
            answers: sampleQuestion.answers?.length || 0
          } : null
        },
        games: {
          count: gamesCount
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}