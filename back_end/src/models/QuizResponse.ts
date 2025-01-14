import mongoose, { Schema, Document } from 'mongoose';

interface Answer {
  questionId: string;
  selectedOption: number;
  responseTime: number;  // Time taken to answer in milliseconds
  isCorrect: boolean;    // Whether the answer was correct
}

export interface IQuizResponse extends Document {
  playerId: string;
  quizId: string;
  answers: Answer[];
  score: number;
  averageResponseTime: number;  // Average response time across all questions
  fastestResponse: number;      // Fastest response time among all questions
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
  },
  responseTime: {
    type: Number,
    required: true,
    min: 0
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
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
  averageResponseTime: {
    type: Number,
    required: true,
    min: 0
  },
  fastestResponse: {
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
QuizResponseSchema.index({ averageResponseTime: 1 });  // Index for sorting by response time
QuizResponseSchema.index({ fastestResponse: 1 });      // Index for sorting by fastest response

// Pre-save middleware to calculate average and fastest response times
QuizResponseSchema.pre('save', function(next) {
  if (!this.answers || this.answers.length === 0) {
    return next(new Error('Quiz response must have at least one answer'));
  }

  // Calculate average response time
  const totalTime = this.answers.reduce((sum, answer) => sum + answer.responseTime, 0);
  this.averageResponseTime = totalTime / this.answers.length;

  // Find fastest response time
  this.fastestResponse = Math.min(...this.answers.map(answer => answer.responseTime));

  next();
});

// Add error handling middleware
QuizResponseSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Player has already submitted answers for this quiz'));
  } else {
    next(error);
  }
});

const QuizResponse = mongoose.model<IQuizResponse>('QuizResponse', QuizResponseSchema);

export default QuizResponse;
