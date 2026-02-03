import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Team from '../../../models/Team';
import Game from '../../../models/Game';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'score'; // score, gamesWon, gamesPlayed
    const limit = parseInt(searchParams.get('limit')) || 10;

    let sortOptions = {};
    
    switch (sortBy) {
      case 'gamesWon':
        sortOptions = { gamesWon: -1, score: -1, name: 1 };
        break;
      case 'gamesPlayed':
        sortOptions = { gamesPlayed: -1, score: -1, name: 1 };
        break;
      case 'winRate':
        // We'll calculate win rate in aggregation
        break;
      default:
        sortOptions = { score: -1, gamesWon: -1, name: 1 };
    }

    let teams;

    if (sortBy === 'winRate') {
      // Use aggregation to calculate win rate
      teams = await Team.aggregate([
        {
          $addFields: {
            winRate: {
              $cond: {
                if: { $eq: ['$gamesPlayed', 0] },
                then: 0,
                else: { $divide: ['$gamesWon', '$gamesPlayed'] }
              }
            }
          }
        },
        {
          $sort: { winRate: -1, gamesWon: -1, score: -1, name: 1 }
        },
        {
          $limit: limit
        }
      ]);
    } else {
      teams = await Team.find({})
        .sort(sortOptions)
        .limit(limit)
        .lean();
      
      // Add win rate calculation
      teams = teams.map(team => ({
        ...team,
        winRate: team.gamesPlayed > 0 ? team.gamesWon / team.gamesPlayed : 0
      }));
    }

    // Get recent games for context
    const recentGames = await Game.find({ gameState: 'completed' })
      .populate('teams.teamId', 'name')
      .populate('winner', 'name')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({ 
      success: true, 
      leaderboard: teams,
      recentGames,
      stats: {
        totalTeams: await Team.countDocuments(),
        totalGames: await Game.countDocuments({ gameState: 'completed' }),
        activeGames: await Game.countDocuments({ 
          gameState: { $in: ['setup', 'active', 'buzzer', 'answering'] } 
        })
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}