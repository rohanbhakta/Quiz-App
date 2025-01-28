import mongoose, { Schema, Document } from 'mongoose';

interface AvatarConfig {
  style: string;
  seed: string;
  backgroundColor: string;
  accessories: string[];
  skinColor: string;
  hairColor: string;
  facialHair: string;
  clothing: string;
  clothingColor: string;
  hairStyle: string;
  eyebrows: string;
  eyes: string;
  mouth: string;
}

export interface IPlayer extends Document {
  id: string;
  name: string;
  score: number;
  quizId: string;
  avatar: AvatarConfig;
}

const AvatarConfigSchema = new Schema({
  style: {
    type: String,
    required: true,
    default: 'avataaars'
  },
  seed: {
    type: String,
    required: true
  },
  backgroundColor: {
    type: String,
    required: true,
    default: '#FFFFFF'
  },
  accessories: {
    type: [String],
    required: true,
    default: []
  },
  skinColor: {
    type: String,
    required: true,
    default: '#F8D5C2'
  },
  hairColor: {
    type: String,
    required: true,
    default: '#000000'
  },
  facialHair: {
    type: String,
    required: true,
    default: ''
  },
  clothing: {
    type: String,
    required: true,
    default: 'blazerShirt'
  },
  clothingColor: {
    type: String,
    required: true,
    default: '#3498DB'
  },
  hairStyle: {
    type: String,
    required: true,
    default: 'shortHairShortFlat'
  },
  eyebrows: {
    type: String,
    required: true,
    default: 'default'
  },
  eyes: {
    type: String,
    required: true,
    default: 'default'
  },
  mouth: {
    type: String,
    required: true,
    default: 'default'
  }
}, {
  _id: false
});

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
  },
  avatar: {
    type: AvatarConfigSchema,
    required: true,
    default: {
      style: 'avataaars',
      seed: 'default1',
      backgroundColor: '#FFFFFF',
      accessories: [],
      skinColor: '#F8D5C2',
      hairColor: '#000000',
      facialHair: '',
      clothing: 'blazerShirt',
      clothingColor: '#3498DB',
      hairStyle: 'shortHairShortFlat',
      eyebrows: 'default',
      eyes: 'default',
      mouth: 'default'
    }
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
