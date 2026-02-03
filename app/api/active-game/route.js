import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import ActiveGame from '../../../models/ActiveGame';

// GET - Get or create game by code
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const gameCode = searchParams.get('code');
    
    if (!gameCode) {
      return NextResponse.json(
        { success: false, error: 'Game code is required' },
        { status: 400 }
      );
    }
    
    const game = await ActiveGame.findOrCreateByCode(gameCode);
    
    return NextResponse.json({ 
      success: true, 
      game: game.getGameState() 
    });
  } catch (error) {
    console.error('GET /api/active-game error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Update game state
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { gameCode, action, data } = body;
    
    if (!gameCode) {
      return NextResponse.json(
        { success: false, error: 'Game code is required' },
        { status: 400 }
      );
    }
    
    const game = await ActiveGame.findOne({ gameCode: gameCode.toUpperCase() });
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'add-team':
        game.addTeam(data.teamName);
        break;
        
      case 'add-player':
        game.addPlayer(data.teamName, data.playerName, data.socketId);
        break;
        
      case 'update-score':
        game.updateScore(data.teamName, data.points);
        break;
        
      case 'add-strike':
        game.addStrike(data.teamName);
        break;
        
      case 'reset-strikes':
        game.resetStrikes();
        break;
        
      case 'reveal-answer':
        game.revealAnswer(data.answerIndex);
        break;
        
      case 'enable-buzzer':
        game.enableBuzzer();
        break;
        
      case 'disable-buzzer':
        game.disableBuzzer();
        break;
        
      case 'set-buzzer-winner':
        game.setBuzzerWinner(data.teamName, data.playerName);
        break;
        
      case 'set-question':
        game.currentQuestion = data.question;
        game.currentQuestionIndex = data.questionIndex || 0;
        break;
        
      case 'add-client':
        game.addClient(data.socketId, data.role, data.teamName);
        break;
        
      case 'remove-client':
        game.removeClient(data.socketId);
        break;
        
      case 'update-state':
        Object.assign(game, data);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    await game.save();
    
    return NextResponse.json({ 
      success: true, 
      game: game.getGameState() 
    });
  } catch (error) {
    console.error('POST /api/active-game error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete game
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const gameCode = searchParams.get('code');
    
    if (!gameCode) {
      return NextResponse.json(
        { success: false, error: 'Game code is required' },
        { status: 400 }
      );
    }
    
    await ActiveGame.deleteOne({ gameCode: gameCode.toUpperCase() });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Game deleted' 
    });
  } catch (error) {
    console.error('DELETE /api/active-game error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
