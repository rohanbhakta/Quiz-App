import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from './config/db';
import mongoose from 'mongoose';
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
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    console.log('Response:', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      timestamp: new Date().toISOString()
    });
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

    // Validate avatar configuration
    const requiredFields = ['style', 'seed', 'backgroundColor'];

    const missingFields = requiredFields.filter(field => !avatar.hasOwnProperty(field));
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid avatar configuration', 
        missingFields 
      });
    }

    const player = new Player({
      id: uuidv4(),
      name,
      quizId,
      avatar
    });

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
    
    answers.forEach((answer: { questionId: string; selectedOption: number; responseTime: number }) => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.selectedOption) {
        score++;
      }
      if (answer.responseTime) {
        totalResponseTime += answer.responseTime;
        fastestResponse = Math.min(fastestResponse, answer.responseTime);
      }
    });

    const response = new QuizResponse({
      playerId,
      quizId,
      answers,
      score,
      averageResponseTime: totalResponseTime / answers.length,
      fastestResponse
    });

    await response.save();
    player.score = score;
    await player.save();

    res.json({ score });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ message: 'Error submitting answers' });
  }
});

app.get('/api/quizzes/:id/results', async (req: express.Request, res: express.Response) => {
  try {
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const responses = await QuizResponse.find({ quizId: req.params.id });
    const players = await Player.find({ 
      id: { $in: responses.map(r => r.playerId) }
    });

    const results = responses.map(response => {
      const maxScore = quiz.questions.length;
      const scorePercentage = (response.score / maxScore) * 100;
      const totalAllowedTime = quiz.questions.reduce((sum, q) => sum + q.timer * 1000, 0);
      const timeEfficiency = Math.max(0, 100 * (1 - response.averageResponseTime / (totalAllowedTime / maxScore)));
      const combinedScore = (scorePercentage * 0.8) + (timeEfficiency * 0.2);

      return {
        player: players.find(p => p.id === response.playerId),
        score: response.score,
        averageResponseTime: response.averageResponseTime,
        fastestResponse: response.fastestResponse,
        totalQuestions: maxScore,
        timeEfficiency: timeEfficiency.toFixed(1) + '%',
        combinedScore
      };
    }).sort((a, b) => b.combinedScore - a.combinedScore);

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
