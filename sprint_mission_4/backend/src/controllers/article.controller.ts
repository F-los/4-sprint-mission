// src/controllers/article.controller.js
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import { CreateArticleRequest, UpdateArticleRequest } from '../types/index.js';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    nickname: string;
  };
}

// Article 생성 API
export const createArticle = async (req: AuthRequest & Request<{}, {}, CreateArticleRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content } = req.body;
    const article = await prisma.article.create({
      data: { 
        title, 
        content,
        userId: req.user!.id
      },
    });
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
};

// Article 목록 조회 API
export const getAllArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = Math.max(0, parseInt((req.query['offset'] as string) ?? '0', 10) || 0);
    const limitRaw = parseInt((req.query['limit'] as string) ?? '10', 10);
    const limit = Math.min(50, Math.max(1, limitRaw || 10)); // 1~50 범위
    const search = ((req.query['search'] as string) ?? '').trim();
    const sort = req.query['sort'] as string;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { content: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const orderBy = sort === 'recent' ? { createdAt: 'desc' as const } : undefined;

    const findManyParams: any = {
      skip: offset,
      take: limit,
      select: { id: true, title: true, content: true, createdAt: true },
    };
    
    if (where) {
      findManyParams.where = where;
    }
    
    if (orderBy) {
      findManyParams.orderBy = orderBy;
    }
    
    const articles = await prisma.article.findMany(findManyParams);

    res.json(articles);
  } catch (err) {
    next(err);
  }
};

// Article 상세 조회 API
export const getArticleById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, title: true, content: true, createdAt: true },
    });
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    res.json(article);
  } catch (err) {
    next(err);
  }
};

// Article 수정 API
export const updateArticle = async (req: Request<{ id: string }, {}, UpdateArticleRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const { title, content } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;

    const updated = await prisma.article.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Article 삭제 API
export const deleteArticle = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.article.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Article not found' });
      return;
    }
    next(err);
  }
};
