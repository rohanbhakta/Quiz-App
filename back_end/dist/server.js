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
const Login_1 = __importDefault(require("./models/Login"));
const auth_1 = __importDefault(require("./routes/auth"));
const auth_2 = require("./middleware/auth");
const app = (0, express_1.default)();
// CORS configuration
const corsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200
};
// Apply CORS middleware
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
// Parse JSON bodies
app.use(express_1.default.json());
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
app.use('/api', auth_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});
// Connect to MongoDB
(0, db_1.connectDB)();
// Quiz routes
app.get('/api/quizzes/user', auth_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        console.log('Fetching quizzes for user:', userId);
        const quizzes = yield Quiz_1.default.find({ creatorId: new mongoose_1.default.Types.ObjectId(userId) }).sort({ createdAt: -1 });
        console.log('Found quizzes:', quizzes);
        const quizResponses = yield QuizResponse_1.default.aggregate([
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
            return Object.assign(Object.assign({}, quiz.toObject()), { participants: responses ? responses.participantCount.length : 0 });
        });
        res.json(quizzesWithParticipants);
    }
    catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
}));
app.delete('/api/quizzes/:id', auth_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const quiz = yield Quiz_1.default.findOne({ id: req.params.id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        if (quiz.creatorId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }
        yield Quiz_1.default.deleteOne({ id: req.params.id });
        yield QuizResponse_1.default.deleteMany({ quizId: req.params.id });
        res.json({ message: 'Quiz deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Error deleting quiz' });
    }
}));
app.delete('/api/auth/account', auth_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const userQuizzes = yield Quiz_1.default.find({ creatorId: new mongoose_1.default.Types.ObjectId(userId) });
        const quizIds = userQuizzes.map(quiz => quiz.id);
        yield Promise.all([
            Quiz_1.default.deleteMany({ creatorId: new mongoose_1.default.Types.ObjectId(userId) }),
            QuizResponse_1.default.deleteMany({ quizId: { $in: quizIds } }),
            Login_1.default.deleteOne({ _id: userId })
        ]);
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Error deleting account' });
    }
}));
app.post('/api/quizzes', auth_2.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Creating quiz:', req.body);
        const { title, questions } = req.body;
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Invalid quiz data' });
        }
        const validatedQuestions = questions.map((q) => (Object.assign(Object.assign({}, q), { id: (0, uuid_1.v4)(), timer: Math.min(Math.max(q.timer || 30, 5), 300) })));
        const userId = req.user.userId;
        const quiz = new Quiz_1.default({
            id: (0, uuid_1.v4)(),
            creatorId: new mongoose_1.default.Types.ObjectId(userId),
            title,
            questions: validatedQuestions
        });
        const savedQuiz = yield quiz.save();
        res.status(201).json(savedQuiz);
    }
    catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Error creating quiz' });
    }
}));
app.get('/api/quizzes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quiz = yield Quiz_1.default.findOne({ id: req.params.id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    }
    catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
}));
app.post('/api/quizzes/:id/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const quizId = req.params.id;
        const quiz = yield Quiz_1.default.findOne({ id: quizId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const player = new Player_1.default({
            id: (0, uuid_1.v4)(),
            name,
            quizId
        });
        yield player.save();
        res.json({ playerId: player.id });
    }
    catch (error) {
        console.error('Error joining quiz:', error);
        res.status(500).json({ message: 'Error joining quiz' });
    }
}));
app.post('/api/quizzes/:id/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playerId, answers } = req.body;
        const quizId = req.params.id;
        const quiz = yield Quiz_1.default.findOne({ id: quizId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const player = yield Player_1.default.findOne({ id: playerId });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
        let score = 0;
        let totalResponseTime = 0;
        let fastestResponse = Infinity;
        answers.forEach((answer) => {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            if (question && question.correctAnswer === answer.selectedOption) {
                score++;
            }
            if (answer.responseTime) {
                totalResponseTime += answer.responseTime;
                fastestResponse = Math.min(fastestResponse, answer.responseTime);
            }
        });
        const response = new QuizResponse_1.default({
            playerId,
            quizId,
            answers,
            score,
            averageResponseTime: totalResponseTime / answers.length,
            fastestResponse
        });
        yield response.save();
        player.score = score;
        yield player.save();
        res.json({ score });
    }
    catch (error) {
        console.error('Error submitting answers:', error);
        res.status(500).json({ message: 'Error submitting answers' });
    }
}));
app.get('/api/quizzes/:id/results', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quiz = yield Quiz_1.default.findOne({ id: req.params.id });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const responses = yield QuizResponse_1.default.find({ quizId: req.params.id });
        const players = yield Player_1.default.find({
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
    }
    catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Error fetching results' });
    }
}));
// Start server
if (process.env.NODE_ENV !== 'production') {
    const PORT = parseInt(process.env.PORT || '5003', 10);
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('CORS enabled for:', corsOptions.origin);
        console.log('MongoDB connection state:', mongoose_1.default.connection.readyState);
    });
}
exports.default = app;
