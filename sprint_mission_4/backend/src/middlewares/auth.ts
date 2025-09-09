import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nickname: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: '토큰이 제공되지 않았습니다.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, nickname: true }
    });

    if (!user) {
      res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
    return;
  }
};

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, nickname: true }
    });

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};