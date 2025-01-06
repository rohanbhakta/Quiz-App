import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  id: string;
  name: string;
  score: number;
  quizId: string;
}

const PlayerSchema = new Schema({
  id: { 
    type: String, 
    required: true,
    trim: true,
    index: { unique: true }
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  score: { 
    type: Number, 
    default: 0,
    min: 0
  },
  quizId: { 
    type: String, 
    required: true,
    trim: true,
    ref: 'Quiz'
  }
}, {
  timestamps: true,
  collection: 'players',
  versionKey: false
});

// Create indexes for performance
PlayerSchema.index({ quizId: 1 });
PlayerSchema.index({ score: -1 });

// Add error handling middleware
PlayerSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Player with this ID already exists'));
  } else {
    next(error);
  }
});

const Player = mongoose.model<IPlayer>('Player', PlayerSchema);

export default Player;
