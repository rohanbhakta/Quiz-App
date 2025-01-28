import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timer: number;  // Time limit in seconds
}

export interface IQuiz extends Document {
  id: string;
  creatorId: string;
  title: string;
  questions: IQuestion[];
  createdAt: Date;
  expirationTime: Date | null;  // When the quiz URL expires
  theme: string;  // Theme name (e.g., 'blue', 'purple', etc.)
  type: string;   // 'quiz' or 'poll'
}

const QuestionSchema = new Schema({
  id: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true
  },
  options: [{ 
    type: String, 
    required: true,
    trim: true
  }],
  correctAnswer: { 
    type: Number, 
    required: true,
    min: 0
  },
  timer: {
    type: Number,
    required: false,
    min: 5,  // Minimum 5 seconds
    max: 300,  // Maximum 5 minutes
  }
}, { 
  _id: false 
});

const QuizSchema = new Schema({
  id: { 
    type: String, 
    required: true,
    trim: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Login'  // Reference to the Login model
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  theme: {
    type: String,
    required: true,
    default: 'blue',
    enum: ['blue', 'purple', 'green', 'orange', 'pink']  // Available theme options
  },
  type: {
    type: String,
    required: true,
    default: 'quiz',
    enum: ['quiz', 'poll']  // Available content types
  },
  questions: {
    type: [QuestionSchema],
    required: true,
    validate: [
      {
        validator: function(questions: IQuestion[]) {
          return questions && questions.length > 0;
        },
        message: 'Quiz must have at least one question'
      }
    ]
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expirationTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'quizzes',
  versionKey: false
});

// Create indexes
QuizSchema.index({ id: 1 }, { unique: true });
QuizSchema.index({ creatorId: 1 });  // Index for faster lookup by creator
QuizSchema.index({ createdAt: -1 });

// Add error handling middleware
QuizSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Quiz with this ID already exists'));
  } else {
    next(error);
  }
});

const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);

export default Quiz;
