import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Question from '../../../models/Question';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');

    let filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== null) filter.isActive = isActive === 'true';

    const questions = await Question.find(filter).sort({ category: 1, createdAt: -1 });
    return NextResponse.json({ success: true, questions });
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
    const { category, question, answers, difficulty } = await request.json();

    if (!category || !question || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: 'Category, question, and answers array are required' },
        { status: 400 }
      );
    }

    if (answers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one answer is required' },
        { status: 400 }
      );
    }

    // Validate answers format
    for (const answer of answers) {
      if (!answer.text || typeof answer.points !== 'number' || answer.points < 1) {
        return NextResponse.json(
          { success: false, error: 'Each answer must have text and points (minimum 1)' },
          { status: 400 }
        );
      }
    }

    const newQuestion = new Question({
      category: category.trim(),
      question: question.trim(),
      answers: answers.map(answer => ({
        text: answer.text.trim(),
        points: answer.points,
        revealed: false
      })),
      difficulty: difficulty || 'medium'
    });

    await newQuestion.save();
    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}