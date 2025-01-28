import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from './config/db';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Quiz from './models/Quiz';
import Player from './models/Player';
import QuizResponse from './models/QuizResponse';
import Login from './models/Login';
import authRoutes from './routes/auth';
import { authMiddleware } from './middleware/auth';

const app = express();

// Log startup configuration
console.log('Server Starting:', {
  environment: process.env.NODE_ENV,
  port: process.env.PORT || '5003',
  timestamp: new Date().toISOString()
});

// Basic security middleware
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS configuration
app.use(cors({
  origin: ["https://quiz-app-frontend-new.vercel.app", "http://localhost:3000"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Handle preflight requests
app.options('*', (req, res) => {
  const allowedOrigins = ["https://quiz-app-frontend-new.vercel.app", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
  next();
});

// Response logging and CORS headers middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    console.log('Response:', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      timestamp: new Date().toISOString()
    });

    // Set CORS headers for every response
    const allowedOrigins = ["https://quiz-app-frontend-new.vercel.app", "http://localhost:3000"];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    return originalSend.call(this, body);
  };
  next();
});

// Mount auth routes
app.use('/api', authRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Connect to MongoDB
connectDB();

// Quiz routes
app.get('/api/quizzes/user', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId;
    const quizzes = await Quiz.find({ creatorId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    
    const quizResponses = await QuizResponse.aggregate([
      {
        $match: {
          quizId: { $in: quizzes.map(quiz => quiz.id) }
        }
      },
      {
        $group: {
          _id: '$quizId',
          participantCount: { $addToSet: '$playerId' }
        }
      }
    ]);

    const quizzesWithParticipants = quizzes.map(quiz => {
      const responses = quizResponses.find(r => r._id === quiz.id);
      return {
        ...quiz.toObject(),
        participants: responses ? responses.participantCount.length : 0
      };
    });

    res.json(quizzesWithParticipants);
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
});

app.delete('/api/quizzes/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId;
    const quiz = await Quiz.findOne({ id: req.params.id });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.creatorId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Quiz.deleteOne({ id: req.params.id });
    await QuizResponse.deleteMany({ quizId: req.params.id });
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz' });
  }
});

app.delete('/api/auth/account', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId;
    const userQuizzes = await Quiz.find({ creatorId: new mongoose.Types.ObjectId(userId) });
    const quizIds = userQuizzes.map(quiz => quiz.id);
    
    await Promise.all([
      Quiz.deleteMany({ creatorId: new mongoose.Types.ObjectId(userId) }),
      QuizResponse.deleteMany({ quizId: { $in: quizIds } }),
      Login.deleteOne({ _id: userId })
    ]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

app.post('/api/quizzes', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { title, questions, theme = 'blue', type = 'quiz' } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }

    const validatedQuestions = questions.map((q: any) => ({
      ...q,
      id: uuidv4(),
      timer: Math.min(Math.max(q.timer || 30, 5), 300)
    }));

    const userId = (req as any).user.userId;
    const quiz = new Quiz({
      id: uuidv4(),
      creatorId: new mongoose.Types.ObjectId(userId),
      title,
      questions: validatedQuestions,
      theme,
      type
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error: any) {
    console.error('Error creating quiz:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map((err: any) => err.message) 
      });
    }
    res.status(500).json({ message: 'Error creating quiz' });
  }
});

app.get('/api/quizzes/:id', async (req: express.Request, res: express.Response) => {
  try {
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

app.post('/api/quizzes/:id/join', async (req: express.Request, res: express.Response) => {
  try {
    const { name, avatar } = req.body;
    const quizId = req.params.id;

    if (!name || !avatar) {
      return res.status(400).json({ message: 'Name and avatar are required' });
    }

    const quiz = await Quiz.findOne({ id: quizId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get auth token if user is logged in
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;

        // Prevent quiz creator from joining their own quiz
        if (quiz.creatorId.toString() === userId) {
          return res.status(403).json({ message: 'You cannot join your own quiz' });
        }

        // Check if authenticated user already has a player for this quiz
        const existingPlayer = await Player.findOne({
          quizId,
          userId: new mongoose.Types.ObjectId(userId)
        });

        if (existingPlayer) {
          return res.json({ playerId: existingPlayer.id });
        }
      } catch (err) {
        // Token verification failed, continue as unauthenticated user
        console.error('Token verification failed:', err);
      }
    }

    // Validate avatar configuration
    const requiredFields = ['style', 'seed', 'backgroundColor'];
    const optionalFields = [
      'accessories',
      'skinColor',
      'hairColor',
      'facialHair',
      'clothing',
      'clothingColor',
      'hairStyle',
      'eyebrows',
      'eyes',
      'mouth'
    ];
    const allowedFields = [...requiredFields, ...optionalFields];

    // Check for required fields
    const missingFields = requiredFields.filter(field => !avatar.hasOwnProperty(field));
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid avatar configuration', 
        missingFields 
      });
    }

    interface SanitizedAvatar {
      style: string;
      seed: string;
      backgroundColor: string;
      accessories?: string[];
      skinColor?: string;
      hairColor?: string;
      facialHair?: string;
      clothing?: string;
      clothingColor?: string;
      hairStyle?: string;
      eyebrows?: string;
      eyes?: string;
      mouth?: string;
    }

    // Sanitize avatar object to only include allowed fields
    const sanitizedAvatar = Object.keys(avatar).reduce<SanitizedAvatar>((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key as keyof SanitizedAvatar] = avatar[key];
      }
      return acc;
    }, {
      style: avatar.style,
      seed: avatar.seed,
      backgroundColor: avatar.backgroundColor,
      accessories: Array.isArray(avatar.accessories) ? avatar.accessories : []
    });

    const playerData: any = {
      id: uuidv4(),
      name,
      quizId,
      avatar: sanitizedAvatar
    };

    // Add userId only if user is authenticated
    if (userId) {
      playerData.userId = new mongoose.Types.ObjectId(userId);
    }

    const player = new Player(playerData);

    await player.save();
    res.json({ playerId: player.id });
  } catch (error) {
    console.error('Error joining quiz:', error);
    res.status(500).json({ message: 'Error joining quiz' });
  }
});

app.post('/api/quizzes/:id/submit', async (req: express.Request, res: express.Response) => {
  try {
    const { playerId, answers } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ id: quizId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const player = await Player.findOne({ id: playerId });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    let score = 0;
    let totalResponseTime = 0;
    let fastestResponse = Infinity;
    
    // Process answers and calculate score
    const processedAnswers = answers.map((answer: { questionId: string; selectedOption: number; responseTime: number }) => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedOption;
      if (isCorrect) {
        score++;
      }
      if (answer.responseTime) {
        totalResponseTime += answer.responseTime;
        fastestResponse = Math.min(fastestResponse, answer.responseTime);
      }
      return {
        ...answer,
        isCorrect
      };
    });

    // Check if player has already submitted answers
    const existingResponse = await QuizResponse.findOne({
      playerId,
      quizId
    });

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted answers for this quiz' });
    }

    const response = new QuizResponse({
      playerId,
      quizId,
      answers: processedAnswers,
      score,
      averageResponseTime: totalResponseTime / answers.length,
      fastestResponse
    });

    console.log('Saving quiz response:', {
      playerId,
      quizId,
      score,
      timestamp: new Date().toISOString()
    });

    await response.save();

    // Update player score
    player.score = score;
    await player.save();

    console.log('Updated player score:', {
      playerId,
      score,
      timestamp: new Date().toISOString()
    });

    res.json({ score });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ message: 'Error submitting answers' });
  }
});

app.get('/api/quizzes/:id/user-answers', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user.userId;
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Find the player associated with this user
    const player = await Player.findOne({ 
      quizId: req.params.id,
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (!player) {
      return res.status(404).json({ message: 'No answers found for this quiz' });
    }

    // Get the quiz response for this player
    const response = await QuizResponse.findOne({
      quizId: req.params.id,
      playerId: player.id
    });

    if (!response) {
      return res.status(404).json({ message: 'No answers found for this quiz' });
    }

    // Return answers with additional details
    const answers = response.answers.map(answer => ({
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      responseTime: answer.responseTime,
      score: quiz.questions.find(q => q.id === answer.questionId)?.correctAnswer === answer.selectedOption ? 1 : 0
    }));

    res.json(answers);
  } catch (error) {
    console.error('Error fetching user answers:', error);
    res.status(500).json({ message: 'Error fetching user answers' });
  }
});

app.get('/api/quizzes/:id/results', async (req: express.Request, res: express.Response) => {
  try {
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('Fetching results for quiz:', {
      quizId: req.params.id,
      timestamp: new Date().toISOString()
    });

    const responses = await QuizResponse.find({ quizId: req.params.id });
    console.log('Found responses:', {
      count: responses.length,
      playerIds: responses.map(r => r.playerId),
      timestamp: new Date().toISOString()
    });

    // First get all players for this quiz
    const players = await Player.find({ quizId: req.params.id });
    console.log('Found players:', {
      count: players.length,
      playerIds: players.map(p => p.id),
      timestamp: new Date().toISOString()
    });

    const results = responses.map(response => {
      const maxScore = quiz.questions.length;
      const scorePercentage = (response.score / maxScore) * 100;
      const totalAllowedTime = quiz.questions.reduce((sum, q) => sum + q.timer * 1000, 0);
      const timeEfficiency = Math.max(0, 100 * (1 - response.averageResponseTime / (totalAllowedTime / maxScore)));
      const combinedScore = (scorePercentage * 0.8) + (timeEfficiency * 0.2);

      const matchedPlayer = players.find(p => p.id === response.playerId);
      if (!matchedPlayer) {
        console.error('Player not found:', {
          playerId: response.playerId,
          quizId: req.params.id,
          availablePlayers: players.map(p => ({ id: p.id, name: p.name })),
          timestamp: new Date().toISOString()
        });
        return null;
      }

      return {
        player: matchedPlayer,
        answers: response.answers,
        score: response.score,
        averageResponseTime: response.averageResponseTime,
        fastestResponse: response.fastestResponse,
        totalQuestions: maxScore,
        timeEfficiency: timeEfficiency.toFixed(1) + '%',
        combinedScore
      };
    })
    .filter(result => result !== null)
    .sort((a, b) => b.combinedScore - a.combinedScore);

    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Start server
const PORT = parseInt(process.env.PORT || '5003', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server Running:', {
    port: PORT,
    environment: process.env.NODE_ENV,
    mongodbStatus: mongoose.connection.readyState,
    timestamp: new Date().toISOString()
  });
});

export default app;
