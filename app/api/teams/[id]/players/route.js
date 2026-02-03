import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Team from '../../../../../models/Team';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    console.log('=== ADD PLAYER API CALLED ===');
    console.log('Team ID from params:', params.id);
    
    await connectDB();
    console.log('Database connected successfully');
    
    const { name } = await request.json();
    console.log('Player name from request:', name);

    if (!name || !name.trim()) {
      console.log('Error: Player name is required');
      return NextResponse.json(
        { success: false, error: 'Player name is required' },
        { status: 400 }
      );
    }

    if (!params.id) {
      console.log('Error: Team ID is required');
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      console.log('Error: Invalid team ID format:', params.id);
      return NextResponse.json(
        { success: false, error: 'Invalid team ID format' },
        { status: 400 }
      );
    }

    console.log('Searching for team with ID:', params.id);
    const team = await Team.findById(params.id);
    console.log('Team found:', team ? `${team.name} (${team._id})` : 'null');
    
    if (!team) {
      // Let's also try to find all teams to debug
      const allTeams = await Team.find({});
      console.log('All teams in database:', allTeams.map(t => ({ id: t._id.toString(), name: t.name })));
      
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if player already exists in team
    const playerExists = team.players.some(player => 
      player.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (playerExists) {
      console.log('Error: Player already exists in team');
      return NextResponse.json(
        { success: false, error: 'Player already exists in team' },
        { status: 400 }
      );
    }

    console.log('Adding player to team...');
    team.players.push({
      name: name.trim(),
      joinedAt: new Date()
    });

    await team.save();
    console.log('Player added successfully. Team now has', team.players.length, 'players');
    
    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('=== ERROR IN ADD PLAYER API ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const playerName = searchParams.get('name');

    if (!playerName) {
      return NextResponse.json(
        { success: false, error: 'Player name is required' },
        { status: 400 }
      );
    }

    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    team.players = team.players.filter(player => 
      player.name.toLowerCase() !== playerName.toLowerCase()
    );

    await team.save();
    return NextResponse.json({ success: true, team });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}