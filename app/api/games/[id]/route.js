import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Game from '../../../../models/Game';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const game = await Game.findById(params.id)
      .populate('teams.teamId', 'name players')
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

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const updates = await request.json();
    
    const game = await Game.findByIdAndUpdate(
      params.id,
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
    const game = await Game.findByIdAndDelete(params.id);
    
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