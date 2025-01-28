import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import Login, { ILogin } from '../models/Login';

const router = express.Router();

// Get environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
  process.exit(1);
}

// // CORS configuration for auth routes
// const corsOptions = {
//   origin: true, // Allow all origins
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
//   credentials: true
// };

// // Apply CORS to all auth routes
// router.use(cors(corsOptions));

// Handle preflight requests
router.options('*', (req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.status(200).end();
});

// Log environment and configuration
console.log('Auth Service Configuration:', {
  environment: process.env.NODE_ENV,
  // corsConfig: corsOptions,
  timestamp: new Date().toISOString()
});

// Sign Up
router.post('/auth/signup', async (req, res) => {
  try {
    console.log('Signup attempt:', {
      email: req.body.email,
      username: req.body.username,
      timestamp: new Date().toISOString()
    });

    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      console.error('Missing required fields:', { email: !!email, username: !!username, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await Login.findOne({ 
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
    const user: ILogin = new Login({ 
      email: email.toLowerCase(), 
      username, 
      password 
    });
    await user.save();
    console.log('User created successfully:', { id: user._id, email: user.email, username: user.username });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, userId: user._id, username: user.username });
  } catch (error: any) {
    console.error('Signup error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map((err: any) => err.message) 
      });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Sign In
router.post('/auth/signin', async (req, res) => {
  try {
    console.log('Signin attempt:', {
      emailOrUsername: req.body.emailOrUsername,
      timestamp: new Date().toISOString()
    });

    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      console.error('Missing required fields:', { emailOrUsername: !!emailOrUsername, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by email or username
    const user: ILogin | null = await Login.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    });

    console.log('User lookup result:', {
      found: !!user,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', {
      userId: user._id,
      username: user.username,
      timestamp: new Date().toISOString()
    });

    res.json({ token, userId: user._id, username: user.username });
  } catch (error) {
    console.error('Signin error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ message: 'Error signing in' });
  }
});

// Verify Token
router.post('/auth/verify', async (req, res) => {
  try {
    console.log('Token verification attempt:', {
      headers: req.headers,
      timestamp: new Date().toISOString()
    });
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
    console.log('Token verified:', {
      userId: decoded.userId,
      username: decoded.username,
      timestamp: new Date().toISOString()
    });

    const user: ILogin | null = await Login.findById(decoded.userId);
    console.log('User lookup result:', user ? { id: user._id, email: user.email, username: user.username } : 'Not found');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({ userId: user._id, email: user.email, username: user.username });
  } catch (error) {
    console.error('Token verification error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Error verifying token' });
  }
});

export default router;
