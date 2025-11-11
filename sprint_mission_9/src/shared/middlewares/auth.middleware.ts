import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

// Mock auth middleware - In production, verify JWT token
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  // Mock: In production, verify JWT token
  if (token === 'mock-jwt-token') {
    req.userId = 1; // Mock user ID
    next();
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
};
