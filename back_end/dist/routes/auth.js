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
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const router = express_1.default.Router();
// Validation middleware
const signupValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
];
// Signin validation middleware
const signinValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
// Signin route
router.post('/signin', signinValidation, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Signin attempt for email:', req.body.email);
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Signin validation failed:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        // Find user by email
        console.log('Looking up user with email:', email);
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            console.log('User not found with email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Check password
        console.log('Checking password for user:', email);
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Generate JWT token
        console.log('Generating token for user:', email);
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        console.log('Signin successful for user:', email);
        // Return success with token
        res.json({
            success: true,
            message: 'Signed in successfully',
            token
        });
    }
    catch (error) {
        console.error('Signin error:', error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({
            success: false,
            message: 'An error occurred during sign in'
        });
    }
}));
// Signup route
router.post('/signup', signupValidation, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received signup request:', {
        body: req.body,
        headers: req.headers
    });
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Signup validation failed:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        // Check if user already exists
        console.log('Checking if user exists:', email);
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        // Create new user
        console.log('Creating new user:', email);
        const user = new User_1.default({
            email,
            password
        });
        try {
            console.log('Attempting to save user to database:', email);
            yield user.save();
            console.log('User saved successfully:', email);
            // Generate JWT token for immediate login
            console.log('Generating token for new user:', email);
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
            console.log('Signup successful for user:', email);
            // Return success with token
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token
            });
        }
        catch (error) {
            console.error('Error saving user:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Signup error:', error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({
            success: false,
            message: 'An error occurred during registration'
        });
    }
}));
exports.default = router;
