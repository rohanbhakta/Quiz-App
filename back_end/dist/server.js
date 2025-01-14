"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid");
const db_1 = require("./config/db");
const mongoose_1 = __importDefault(require("mongoose"));
const Quiz_1 = __importDefault(require("./models/Quiz"));
const Player_1 = __importDefault(require("./models/Player"));
const QuizResponse_1 = __importDefault(require("./models/QuizResponse"));
const auth_1 = __importDefault(require("./routes/auth"));
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
// CORS configuration
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
// Connect to MongoDB
(0, db_1.connectDB)();
// Create a new quiz (protected route)
app.post('/api/quizzes', auth_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received request to create quiz');
        console.log('Request headers:', req.headers);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('MongoDB connection state:', mongoose_1.default.connection.readyState);
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
        const validatedQuestions = questions.map((q) => {
            // Ensure timer is between 5 and 300 seconds
            const timer = Math.min(Math.max(q.timer || 30, 5), 300);
            return Object.assign(Object.assign({}, q), { id: (0, uuid_1.v4)(), timer });
        });
        console.log('Creating quiz with validated questions:', validatedQuestions);
        const quiz = new Quiz_1.default({
            id: (0, uuid_1.v4)(),
            title,
            questions: validatedQuestions
        });
        console.log('Created quiz model:', quiz);
        try {
            const savedQuiz = yield quiz.save();
            console.log('Quiz saved successfully:', savedQuiz);
            res.status(201).json(savedQuiz);
        }
        catch (error) {
            console.error('Error saving quiz to database:', error);
            if (error.name === 'ValidationError' && error.errors) {
                return res.status(400).json({
                    message: 'Quiz validation failed',
                    errors: Object.values(error.errors).map((err) => err.message)
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({
            message: 'Error creating quiz',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get a quiz by ID
app.get('/api/quizzes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching quiz:', req.params.id);
        const quiz = yield Quiz_1.default.findOne({ id: req.params.id });
        if (!quiz) {
            console.log('Quiz not found:', req.params.id);
            return res.status(404).json({ message: 'Quiz not found' });
        }
        console.log('Quiz found:', quiz);
        res.json(quiz);
    }
    catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
}));
// Join a quiz as a player
app.post('/api/quizzes/:id/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Player joining quiz:', req.params.id, req.body);
        const { name } = req.body;
        const quizId = req.params.id;
        // Check if quiz exists
        const quiz = yield Quiz_1.default.findOne({ id: quizId });
        if (!quiz) {
            console.log('Quiz not found for joining:', quizId);
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const player = new Player_1.default({
            id: (0, uuid_1.v4)(),
            name,
            quizId
        });
        yield player.save();
        console.log('Player joined successfully:', player);
        res.json({ playerId: player.id });
    }
    catch (error) {
        console.error('Error joining quiz:', error);
        res.status(500).json({ message: 'Error joining quiz' });
    }
}));
// Submit quiz answers
app.post('/api/quizzes/:id/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Submitting answers for quiz:', req.params.id);
        console.log('Request body:', req.body);
        const { playerId, answers } = req.body;
        const quizId = req.params.id;
        console.log('Looking up quiz:', quizId);
        const quiz = yield Quiz_1.default.findOne({ id: quizId });
        if (!quiz) {
            console.log('Quiz not found for submission:', quizId);
            return res.status(404).json({ message: 'Quiz not found' });
        }
        console.log('Looking up player:', playerId);
        const player = yield Player_1.default.findOne({ id: playerId });
        if (!player) {
            console.log('Player not found:', playerId);
            return res.status(404).json({ message: 'Player not found' });
        }
        // Calculate score and response times
        let score = 0;
        let totalResponseTime = 0;
        let fastestResponse = Infinity;
        console.log('Calculating score and response times for answers:', answers);
        answers.forEach((answer) => {
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
        const response = new QuizResponse_1.default({
            playerId,
            quizId,
            answers,
            score,
            averageResponseTime,
            fastestResponse
        });
        console.log('Saving quiz response:', response);
        yield response.save();
        console.log('Quiz response saved successfully');
        // Update player score
        player.score = score;
        yield player.save();
        console.log('Player score updated successfully');
        res.json({ score });
    }
    catch (error) {
        console.error('Detailed error submitting answers:', error);
        res.status(500).json({
            message: 'Error submitting answers',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Get quiz results
app.get('/api/quizzes/:id/results', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching results for quiz:', req.params.id);
        const quizId = req.params.id;
        const quiz = yield Quiz_1.default.findOne({ id: quizId });
        if (!quiz) {
            console.log('Quiz not found for results:', quizId);
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const responses = yield QuizResponse_1.default.find({ quizId });
        const players = yield Player_1.default.find({
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
    }
    catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Error fetching results' });
    }
}));
// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
// Export the app for serverless
exports.default = app;
