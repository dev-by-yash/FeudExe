import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Game from '../../../../../models/Game';
import Question from '../../../../../models/Question';
import Team from '../../../../../models/Team';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { answerIndex, isCorrect } = await request.json();

    const game = await Game.findById(id)
      .populate('currentQuestion')
      .populate('teams.teamId');

    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.gameState !== 'answering') {
      return NextResponse.json(
        { success: false, error: 'Not in answering state' },
        { status: 400 }
      );
    }

    const question = game.currentQuestion;
    const currentTeam = game.teams.find(t => 
      t.teamId._id.toString() === game.currentTeamTurn.toString()
    );

    if (!currentTeam) {
      return NextResponse.json(
        { success: false, error: 'Current team not found' },
        { status: 400 }
      );
    }

    if (isCorrect && answerIndex !== undefined) {
      // Reveal the answer
      if (answerIndex >= 0 && answerIndex < question.answers.length) {
        question.answers[answerIndex].revealed = true;
        await question.save();

        // Award points
        const points = question.answers[answerIndex].points;
        currentTeam.score += points;

        // Update team's total score in database
        await Team.findByIdAndUpdate(currentTeam.teamId._id, {
          $inc: { score: points }
        });

        // Add to question history
        const historyEntry = game.questionHistory.find(h => 
          h.questionId.toString() === question._id.toString()
        );

        if (historyEntry) {
          historyEntry.revealedAnswers.push(answerIndex);
          historyEntry.pointsAwarded.push({
            teamId: currentTeam.teamId._id,
            points
          });
        } else {
          game.questionHistory.push({
            questionId: question._id,
            revealedAnswers: [answerIndex],
            pointsAwarded: [{
              teamId: currentTeam.teamId._id,
              points
            }]
          });
        }

        // Check if all answers are revealed
        const allRevealed = question.answers.every(answer => answer.revealed);
        if (allRevealed) {
          game.gameState = 'completed';
          game.timer.isActive = false;
        } else {
          game.gameState = 'active';
          // Continue with same team or switch based on your rules
        }
      }
    } else {
      // Wrong answer - add strike
      currentTeam.strikes += 1;

      if (currentTeam.strikes >= game.settings.maxStrikes) {
        // Switch to next team or end round
        const nextTeamIndex = (game.teams.findIndex(t => 
          t.teamId._id.toString() === game.currentTeamTurn.toString()
        ) + 1) % game.teams.length;
        
        game.currentTeamTurn = game.teams[nextTeamIndex].teamId._id;
        currentTeam.strikes = 0; // Reset strikes for the team that got max strikes
      }

      game.gameState = 'active';
    }

    // Stop timer
    game.timer.isActive = false;

    await game.save();
    await game.populate('teams.teamId', 'name');
    await game.populate('currentQuestion');

    return NextResponse.json({ success: true, game });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}