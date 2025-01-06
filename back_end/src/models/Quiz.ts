import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface IQuiz extends Document {
  id: string;
  title: string;
  questions: IQuestion[];
  createdAt: Date;
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
  title: { 
    type: String, 
    required: true,
    trim: true
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
  }
}, {
  timestamps: true,
  collection: 'quizzes',
  versionKey: false
});

// Create indexes
QuizSchema.index({ id: 1 }, { unique: true });
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
