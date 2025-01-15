import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
  process.exit(1);
}

// Log middleware initialization
console.log('Auth Middleware Configuration:', {
  environment: process.env.NODE_ENV,
  tokenExpiry: '24h'
});

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Log auth attempt with request details
    console.log('Auth attempt:', {
      path: req.path,
      method: req.method,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
    
    console.log('Token verified:', {
      userId: decoded.userId,
      username: decoded.username,
      timestamp: new Date().toISOString()
    });
    
    if (!decoded.userId) {
      console.error('No userId in token:', decoded);
      return res.status(401).json({ message: 'Invalid token format' });
    }

    req.user = decoded;
    console.log('Auth successful:', {
      userId: req.user.userId,
      username: req.user.username,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: req.path,
      origin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
