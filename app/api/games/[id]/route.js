import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Game from '../../../../models/Game';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Await params in Next.js 15+
    console.log('📍 GET /api/games/[id] - Requested ID:', id);
    
    // Don't populate - just get the game with embedded team data
    const game = await Game.findById(id);
    
    console.log('📍 Game found:', game ? `YES (${game._id})` : 'NO');
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, game });
  } catch (error) {
    console.error('❌ GET /api/games/[id] ERROR:', error.message);
    console.error('❌ Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Await params in Next.js 15+
    const updates = await request.json();
    
    const game = await Game.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('teams.teamId', 'name')
     .populate('currentQuestion')
     .populate('winner', 'name');

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, game });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Await params in Next.js 15+
    const game = await Game.findByIdAndDelete(id);
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}