import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; username: string };
    console.log('Decoded token:', decoded);
    
    if (!decoded.userId) {
      console.error('No userId in token:', decoded);
      return res.status(401).json({ message: 'Invalid token format' });
    }

    req.user = decoded;
    console.log('User set in request:', req.user);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
