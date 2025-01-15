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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Login_1 = __importDefault(require("../models/Login"));
const router = express_1.default.Router();
// Log route registration
console.log('Registering auth routes:');
console.log('- POST /auth/signup');
console.log('- POST /auth/signin');
console.log('- POST /auth/verify');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Sign Up
router.post('/auth/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received signup request:', req.body);
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            console.error('Missing required fields:', { email: !!email, username: !!username, password: !!password });
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Check if user already exists
        const existingUser = yield Login_1.default.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });
        if (existingUser) {
            console.log('User already exists:', { email: existingUser.email, username: existingUser.username });
            if (existingUser.email === email.toLowerCase()) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            return res.status(400).json({ message: 'Username already taken' });
        }
        // Create new user
        const user = new Login_1.default({
            email: email.toLowerCase(),
            username,
            password
        });
        yield user.save();
        console.log('User created successfully:', { id: user._id, email: user.email, username: user.username });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, userId: user._id, username: user.username });
    }
    catch (error) {
        console.error('Signup error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: Object.values(error.errors).map((err) => err.message)
            });
        }
        res.status(500).json({ message: 'Error creating user' });
    }
}));
// Sign In
router.post('/auth/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received signin request:', { emailOrUsername: req.body.emailOrUsername });
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            console.error('Missing required fields:', { emailOrUsername: !!emailOrUsername, password: !!password });
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Find user by email or username
        const user = yield Login_1.default.findOne({
            $or: [
                { email: emailOrUsername.toLowerCase() },
                { username: emailOrUsername }
            ]
        });
        console.log('User lookup result:', user ? { id: user._id, email: user.email, username: user.username } : 'Not found');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check password
        const isMatch = yield user.comparePassword(password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        console.log('Login successful:', { userId: user._id, username: user.username });
        res.json({ token, userId: user._id, username: user.username });
    }
    catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Error signing in' });
    }
}));
// Verify Token
router.post('/auth/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Token verification attempt');
        console.log('Headers:', req.headers);
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'No token provided' });
        }
        console.log('Verifying token:', token);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);
        const user = yield Login_1.default.findById(decoded.userId);
        console.log('User lookup result:', user ? { id: user._id, email: user.email, username: user.username } : 'Not found');
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.json({ userId: user._id, email: user.email, username: user.username });
    }
    catch (error) {
        console.error('Token verification error:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(500).json({ message: 'Error verifying token' });
    }
}));
exports.default = router;
