import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Team from '../../../../models/Team';

export async function GET() {
  try {
    await connectDB();
    console.log('Debug: Connected to MongoDB');
    
    const teams = await Team.find({});
    console.log('Debug: Found teams:', teams.map(t => ({ id: t._id, name: t.name })));
    
    return NextResponse.json({ 
      success: true, 
      teams: teams.map(t => ({ 
        id: t._id.toString(), 
        name: t.name, 
        playersCount: t.players?.length || 0 
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}