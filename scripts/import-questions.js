const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feud-game';

// Question schema (same as in models/Question.js)
const QuestionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answers: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    points: {
      type: Number,
      required: true,
      min: 1
    },
    revealed: {
      type: Boolean,
      default: false
    }
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

QuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.totalPoints = this.answers.reduce((sum, answer) => sum + answer.points, 0);
  next();
});

const Question = mongoose.model('Question', QuestionSchema);

async function importQuestions(jsonFilePath) {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON file must contain an array of questions');
    }

    console.log(`Found ${jsonData.length} questions to import`);

    let imported = 0;
    let skipped = 0;

    for (const questionData of jsonData) {
      try {
        // Validate required fields
        if (!questionData.category || !questionData.question || !questionData.answers) {
          console.log(`Skipping invalid question: ${questionData.question || 'No question text'}`);
          skipped++;
          continue;
        }

        // Check if question already exists
        const existingQuestion = await Question.findOne({
          category: questionData.category,
          question: questionData.question
        });

        if (existingQuestion) {
          console.log(`Question already exists: ${questionData.question}`);
          skipped++;
          continue;
        }

        // Create new question
        const question = new Question({
          category: questionData.category.trim(),
          question: questionData.question.trim(),
          answers: questionData.answers.map(answer => ({
            text: answer.text.trim(),
            points: answer.points,
            revealed: false
          })),
          difficulty: questionData.difficulty || 'medium',
          isActive: questionData.isActive !== false
        });

        await question.save();
        imported++;
        console.log(`Imported: ${questionData.question}`);
      } catch (error) {
        console.error(`Error importing question "${questionData.question}":`, error.message);
        skipped++;
      }
    }

    console.log(`\nImport completed:`);
    console.log(`- Imported: ${imported} questions`);
    console.log(`- Skipped: ${skipped} questions`);

  } catch (error) {
    console.error('Import failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Usage
if (require.main === module) {
  const jsonFilePath = process.argv[2];
  
  if (!jsonFilePath) {
    console.log('Usage: node import-questions.js <path-to-json-file>');
    console.log('\nJSON file format:');
    console.log('[');
    console.log('  {');
    console.log('    "category": "General Knowledge",');
    console.log('    "question": "Name something people do when they wake up",');
    console.log('    "answers": [');
    console.log('      { "text": "Brush teeth", "points": 32 },');
    console.log('      { "text": "Take a shower", "points": 28 },');
    console.log('      { "text": "Get dressed", "points": 25 },');
    console.log('      { "text": "Eat breakfast", "points": 15 }');
    console.log('    ],');
    console.log('    "difficulty": "easy"');
    console.log('  }');
    console.log(']');
    process.exit(1);
  }

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`File not found: ${jsonFilePath}`);
    process.exit(1);
  }

  importQuestions(jsonFilePath);
}

module.exports = { importQuestions };