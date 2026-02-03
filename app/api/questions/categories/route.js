import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Question from '../../../../models/Question';

export async function GET() {
  try {
    await connectDB();
    
    // Get unique categories from questions
    const categories = await Question.distinct('category', { isActive: true });
    
    return NextResponse.json({ 
      success: true, 
      categories: categories.sort() 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}