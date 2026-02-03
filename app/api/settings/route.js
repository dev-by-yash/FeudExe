import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Settings from '../../../models/Settings';

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = new Settings({
        teamSize: 4,
        maxStrikes: 3,
        questionTimeLimit: 30,
        buzzerTimeLimit: 5,
        pointsToWin: 300,
        categories: []
      });
      await settings.save();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const updates = await request.json();

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(updates);
    } else {
      Object.assign(settings, updates);
      settings.updatedAt = Date.now();
    }

    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}