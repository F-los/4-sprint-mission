// src/controllers/comment.controller.js
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import { CreateCommentRequest, UpdateCommentRequest } from '../types/index.js';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nickname: string;
  };
}

export const createProductComment = async (req: AuthRequest & Request<{ productId: string }, {}, CreateCommentRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user!.id,
        productId: parseInt(req.params.productId),
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

export const createArticleComment = async (req: AuthRequest & Request<{ articleId: string }, {}, CreateCommentRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user!.id,
        articleId: parseInt(req.params.articleId),
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

export const getProductComments = async (req: Request<{ productId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cursor, limit = 10 } = req.query;
    const comments = await prisma.comment.findMany({
      where: { productId: parseInt(req.params.productId) },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      ...(cursor && { skip: 1, cursor: { id: parseInt(cursor as string) } }),
      select: { id: true, content: true, createdAt: true },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

export const getArticleComments = async (req: Request<{ articleId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cursor, limit = 10 } = req.query;
    const comments = await prisma.comment.findMany({
      where: { articleId: parseInt(req.params.articleId) },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      ...(cursor && { skip: 1, cursor: { id: parseInt(cursor as string) } }),
      select: { id: true, content: true, createdAt: true },
    });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

export const updateComment = async (req: Request<{ id: string }, {}, UpdateCommentRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await prisma.comment.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    next(err);
  }
};

export const deleteComment = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.comment.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    next(err);
  }
};
