import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Team from '../../../models/Team';

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find({}).sort({ score: -1, name: 1 });
    return NextResponse.json({ success: true, teams });
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
    const { name, players } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Check if team already exists
    const existingTeam = await Team.findOne({ name: name.trim() });
    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Team name already exists' },
        { status: 400 }
      );
    }

    const team = new Team({
      name: name.trim(),
      players: players || []
    });

    await team.save();
    return NextResponse.json({ success: true, team }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}