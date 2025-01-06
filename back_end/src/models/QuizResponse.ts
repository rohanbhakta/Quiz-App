import mongoose, { Schema, Document } from 'mongoose';

interface Answer {
  questionId: string;
  selectedOption: number;
}

export interface IQuizResponse extends Document {
  playerId: string;
  quizId: string;
  answers: Answer[];
  score: number;
  submittedAt: Date;
}

const AnswerSchema = new Schema({
  questionId: { 
    type: String, 
    required: true,
    trim: true
  },
  selectedOption: { 
    type: Number, 
    required: true,
    min: 0
  }
}, { 
  _id: false 
});

const QuizResponseSchema = new Schema({
  playerId: { 
    type: String, 
    required: true,
    trim: true,
    ref: 'Player'
  },
  quizId: { 
    type: String, 
    required: true,
    trim: true,
    ref: 'Quiz'
  },
  answers: {
    type: [AnswerSchema],
    required: true,
    validate: [
      {
        validator: function(answers: Answer[]) {
          return answers && answers.length > 0;
        },
        message: 'Quiz response must have at least one answer'
      }
    ]
  },
  score: { 
    type: Number, 
    required: true,
    min: 0
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  collection: 'quiz_responses',
  versionKey: false
});

// Create indexes
QuizResponseSchema.index({ playerId: 1, quizId: 1 });
QuizResponseSchema.index({ submittedAt: -1 });
QuizResponseSchema.index({ score: -1 });

// Add error handling middleware
QuizResponseSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Player has already submitted answers for this quiz'));
  } else {
    next(error);
  }
});

// Pre-save hook to ensure answers array is not empty
QuizResponseSchema.pre('save', function(next) {
  if (!this.answers || this.answers.length === 0) {
    next(new Error('Quiz response must have at least one answer'));
  } else {
    next();
  }
});

const QuizResponse = mongoose.model<IQuizResponse>('QuizResponse', QuizResponseSchema);

export default QuizResponse;
