import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Game from '../../../../../models/Game';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { teamId, playerId } = await request.json();

    const game = await Game.findById(params.id);
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.gameState !== 'active' && game.gameState !== 'buzzer') {
      return NextResponse.json(
        { success: false, error: 'Buzzer not active' },
        { status: 400 }
      );
    }

    // Check if team is in the game
    const team = game.teams.find(t => t.teamId.toString() === teamId);
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not in this game' },
        { status: 400 }
      );
    }

    // Set game state to answering and current team
    game.gameState = 'answering';
    game.currentTeamTurn = teamId;
    game.timer = {
      duration: 10, // 10 seconds to answer
      startTime: new Date(),
      isActive: true
    };

    await game.save();
    await game.populate('teams.teamId', 'name');
    await game.populate('currentQuestion');

    return NextResponse.json({ 
      success: true, 
      game,
      buzzerWinner: {
        teamId,
        teamName: team.name,
        playerId
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}