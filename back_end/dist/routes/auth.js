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
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Sign Up
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        const existingUser = yield Login_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        // Create new user
        const user = new Login_1.default({ email, password });
        yield user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, userId: user._id });
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
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user
        const user = yield Login_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check password
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, userId: user._id });
    }
    catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Error signing in' });
    }
}));
// Verify Token
router.post('/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield Login_1.default.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.json({ userId: user._id, email: user.email });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
}));
exports.default = router;
