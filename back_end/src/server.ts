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

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://quiz-app-frontend.vercel.app'
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200,
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Mount auth routes
app.use('/api', authRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Connect to MongoDB
connectDB();

// Quiz routes
app.get('/api/quizzes/user', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    console.log('Fetching quizzes for user:', userId);
    const quizzes = await Quiz.find({ creatorId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    console.log('Found quizzes:', quizzes);
    
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

app.delete('/api/quizzes/:id', authMiddleware, async (req, res) => {
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

app.delete('/api/auth/account', authMiddleware, async (req, res) => {
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

app.post('/api/quizzes', authMiddleware, async (req, res) => {
  try {
    console.log('Creating quiz:', req.body);
    const { title, questions } = req.body;

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
      questions: validatedQuestions
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
});

app.get('/api/quizzes/:id', async (req, res) => {
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

app.post('/api/quizzes/:id/join', async (req, res) => {
  try {
    const { name } = req.body;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ id: quizId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const player = new Player({
      id: uuidv4(),
      name,
      quizId
    });

    await player.save();
    res.json({ playerId: player.id });
  } catch (error) {
    console.error('Error joining quiz:', error);
    res.status(500).json({ message: 'Error joining quiz' });
  }
});

app.post('/api/quizzes/:id/submit', async (req, res) => {
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

app.get('/api/quizzes/:id/results', async (req, res) => {
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
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS enabled for:', corsOptions.origin);
  console.log('MongoDB connection state:', mongoose.connection.readyState);
});

export default app;
