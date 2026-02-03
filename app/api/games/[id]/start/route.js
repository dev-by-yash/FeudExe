import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Game from '../../../../../models/Game';
import Question from '../../../../../models/Question';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { questionId, category } = await request.json();

    const game = await Game.findById(params.id);
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.gameState !== 'waiting') {
      return NextResponse.json(
        { success: false, error: 'Game is already in progress' },
        { status: 400 }
      );
    }

    let question;
    if (questionId) {
      question = await Question.findById(questionId);
    } else if (category) {
      // Get random question from category
      const questions = await Question.find({ category, isActive: true });
      if (questions.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No questions found in this category' },
          { status: 404 }
        );
      }
      question = questions[Math.floor(Math.random() * questions.length)];
    } else {
      // Get random question from all active questions
      const questions = await Question.find({ isActive: true });
      if (questions.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No active questions found' },
          { status: 404 }
        );
      }
      question = questions[Math.floor(Math.random() * questions.length)];
    }

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Reset question answers to not revealed
    question.answers.forEach(answer => answer.revealed = false);

    game.currentQuestion = question._id;
    game.gameState = 'active';
    game.currentTeamTurn = game.teams[0].teamId;
    game.timer = {
      duration: game.settings.questionTimeLimit,
      startTime: new Date(),
      isActive: true
    };

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