import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from './config/db';
import Quiz from './models/Quiz';
import Player from './models/Player';
import QuizResponse from './models/QuizResponse';

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || ''] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Create a new quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    console.log('Creating quiz with data:', req.body);
    const { title, questions } = req.body;
    
    const quiz = new Quiz({
      id: uuidv4(),
      title,
      questions: questions.map((q: any) => ({
        ...q,
        id: uuidv4()
      }))
    });

    const savedQuiz = await quiz.save();
    console.log('Quiz saved successfully:', savedQuiz);
    res.status(201).json(savedQuiz);
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

    // Calculate score
    let score = 0;
    console.log('Calculating score for answers:', answers);
    answers.forEach((answer: { questionId: string; selectedOption: number }) => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      console.log('Checking question:', question, 'for answer:', answer);
      if (question && question.correctAnswer === answer.selectedOption) {
        score++;
      }
    });
    console.log('Final score:', score);

    // Save response
    const response = new QuizResponse({
      playerId,
      quizId,
      answers,
      score
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

    const results = responses.map(response => ({
      player: players.find(p => p.id === response.playerId),
      score: response.score
    }));

    console.log('Quiz results:', results);
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for serverless
export default app;
