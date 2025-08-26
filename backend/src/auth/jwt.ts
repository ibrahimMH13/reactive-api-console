import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
import { verifyCognitoToken } from './cognito';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Determine if this is a Cognito token or local JWT
    let user: User;
    
    if (process.env.NODE_ENV === 'production' || process.env.USE_COGNITO === 'true') {
      // Use Cognito verification in production
      user = await verifyCognitoToken(token);
    } else {
      // Fallback to local JWT for development/testing
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name
      };
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const verifySocketToken = async (token: string): Promise<User> => {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.USE_COGNITO === 'true') {
      return await verifyCognitoToken(token);
    } else {
      // Fallback for development
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name
      };
    }
  } catch (error) {
    throw new Error('Invalid socket token');
  }
};

// Helper function to create local JWT tokens (for testing)
export const createLocalToken = (user: { id: string; email: string; name?: string }): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    },
    process.env.JWT_SECRET || 'dev-secret'
  );
};