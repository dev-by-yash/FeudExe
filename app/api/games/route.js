import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Game from '../../../models/Game';
import Team from '../../../models/Team';

export async function GET() {
  try {
    await connectDB();
    const games = await Game.find({})
      .populate('teams.teamId', 'name')
      .populate('currentQuestion')
      .populate('winner', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, games });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { teamIds, settings } = await request.json();

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 teams are required' },
        { status: 400 }
      );
    }

    // Verify teams exist
    const teams = await Team.find({ _id: { $in: teamIds } });
    if (teams.length !== teamIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more teams not found' },
        { status: 404 }
      );
    }

    const game = new Game({
      teams: teams.map(team => ({
        teamId: team._id,
        name: team.name,
        score: 0,
        strikes: 0
      })),
      gameState: 'waiting',
      settings: {
        teamSize: settings?.teamSize || 4,
        maxStrikes: settings?.maxStrikes || 3,
        questionTimeLimit: settings?.questionTimeLimit || 30
      }
    });

    await game.save();
    
    // Populate the response
    await game.populate('teams.teamId', 'name');
    
    return NextResponse.json({ success: true, game }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}