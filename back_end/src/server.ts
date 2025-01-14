import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from './config/db';
import mongoose from 'mongoose';
import Quiz from './models/Quiz';
import Player from './models/Player';
import QuizResponse from './models/QuizResponse';

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Create a new quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    console.log('Received request to create quiz');
    console.log('Request headers:', req.headers);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    if (!req.body || !req.body.title || !req.body.questions) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ 
        message: 'Invalid request body',
        required: { title: 'string', questions: 'array' },
        received: req.body 
      });
    }

    const { title, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('Invalid questions array:', questions);
      return res.status(400).json({ 
        message: 'Questions must be a non-empty array',
        received: questions 
      });
    }

    // Validate and format questions
    const validatedQuestions = questions.map((q: any) => {
      // Ensure timer is between 5 and 300 seconds
      const timer = Math.min(Math.max(q.timer || 30, 5), 300);
      
      return {
        ...q,
        id: uuidv4(),
        timer
      };
    });

    console.log('Creating quiz with validated questions:', validatedQuestions);

    const quiz = new Quiz({
      id: uuidv4(),
      title,
      questions: validatedQuestions
    });

    console.log('Created quiz model:', quiz);

    try {
      const savedQuiz = await quiz.save();
      console.log('Quiz saved successfully:', savedQuiz);
      res.status(201).json(savedQuiz);
    } catch (error: any) {
      console.error('Error saving quiz to database:', error);
      if (error.name === 'ValidationError' && error.errors) {
        return res.status(400).json({
          message: 'Quiz validation failed',
          errors: Object.values(error.errors).map((err: any) => err.message)
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ 
      message: 'Error creating quiz',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get a quiz by ID
app.get('/api/quizzes/:id', async (req, res) => {
  try {
    console.log('Fetching quiz:', req.params.id);
    const quiz = await Quiz.findOne({ id: req.params.id });
    if (!quiz) {
      console.log('Quiz not found:', req.params.id);
      return res.status(404).json({ message: 'Quiz not found' });
    }
    console.log('Quiz found:', quiz);
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
});

// Join a quiz as a player
app.post('/api/quizzes/:id/join', async (req, res) => {
  try {
    console.log('Player joining quiz:', req.params.id, req.body);
    const { name } = req.body;
    const quizId = req.params.id;

    // Check if quiz exists
    const quiz = await Quiz.findOne({ id: quizId });
    if (!quiz) {
      console.log('Quiz not found for joining:', quizId);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const player = new Player({
      id: uuidv4(),
      name,
      quizId
    });

    await player.save();
    console.log('Player joined successfully:', player);
    res.json({ playerId: player.id });
  } catch (error) {
    console.error('Error joining quiz:', error);
    res.status(500).json({ message: 'Error joining quiz' });
  }
});

// Submit quiz answers
app.post('/api/quizzes/:id/submit', async (req, res) => {
  try {
    console.log('Submitting answers for quiz:', req.params.id);
    console.log('Request body:', req.body);
    
    const { playerId, answers } = req.body;
    const quizId = req.params.id;

    console.log('Looking up quiz:', quizId);
    const quiz = await Quiz.findOne({ id: quizId });
    if (!quiz) {
      console.log('Quiz not found for submission:', quizId);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('Looking up player:', playerId);
    const player = await Player.findOne({ id: playerId });
    if (!player) {
      console.log('Player not found:', playerId);
      return res.status(404).json({ message: 'Player not found' });
    }

    // Calculate score and response times
    let score = 0;
    let totalResponseTime = 0;
    let fastestResponse = Infinity;
    
    console.log('Calculating score and response times for answers:', answers);
    answers.forEach((answer: { questionId: string; selectedOption: number; responseTime: number }) => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      console.log('Checking question:', question, 'for answer:', answer);
      
      // Calculate score
      if (question && question.correctAnswer === answer.selectedOption) {
        score++;
      }

      // Track response times
      if (answer.responseTime) {
        totalResponseTime += answer.responseTime;
        fastestResponse = Math.min(fastestResponse, answer.responseTime);
      }
    });

    const averageResponseTime = totalResponseTime / answers.length;
    console.log('Final score:', score);
    console.log('Average response time:', averageResponseTime);
    console.log('Fastest response:', fastestResponse);

    // Save response
    const response = new QuizResponse({
      playerId,
      quizId,
      answers,
      score,
      averageResponseTime,
      fastestResponse
    });
    console.log('Saving quiz response:', response);
    await response.save();
    console.log('Quiz response saved successfully');

    // Update player score
    player.score = score;
    await player.save();
    console.log('Player score updated successfully');

    res.json({ score });
  } catch (error) {
    console.error('Detailed error submitting answers:', error);
    res.status(500).json({ 
      message: 'Error submitting answers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get quiz results
app.get('/api/quizzes/:id/results', async (req, res) => {
  try {
    console.log('Fetching results for quiz:', req.params.id);
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ id: quizId });
    if (!quiz) {
      console.log('Quiz not found for results:', quizId);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const responses = await QuizResponse.find({ quizId });
    const players = await Player.find({ 
      id: { $in: responses.map(r => r.playerId) }
    });

    const results = responses.map(response => {
      // Calculate score percentage (0-100)
      const maxScore = quiz.questions.length;
      const scorePercentage = (response.score / maxScore) * 100;
      
      // Calculate time efficiency (0-100)
      // For each question, calculate how efficiently the time was used
      const totalAllowedTime = quiz.questions.reduce((sum, q) => sum + q.timer * 1000, 0);
      const timeEfficiency = Math.max(0, 100 * (1 - response.averageResponseTime / (totalAllowedTime / maxScore)));
      
      // Calculate combined score
      // 80% weight for accuracy, 20% weight for speed
      const combinedScore = (scorePercentage * 0.8) + (timeEfficiency * 0.2);

      console.log('Calculating score for player:', {
        playerId: response.playerId,
        score: response.score,
        maxScore,
        scorePercentage,
        averageResponseTime: response.averageResponseTime,
        totalAllowedTime,
        timeEfficiency,
        combinedScore
      });

      return {
        player: players.find(p => p.id === response.playerId),
        score: response.score,
        averageResponseTime: response.averageResponseTime,
        fastestResponse: response.fastestResponse,
        totalQuestions: maxScore,
        timeEfficiency: timeEfficiency.toFixed(1) + '%',
        combinedScore
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

    console.log('Quiz results:', results);
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for serverless
export default app;
