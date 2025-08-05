// src/controllers/article.controller.js
import prisma from '../prisma/client.js';

// Article 생성 API
export const createArticle = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const article = await prisma.article.create({
      data: { title, content },
    });
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
};

// Article 목록 조회 API
export const getAllArticles = async (req, res, next) => {
  try {
    const { q, sort = 'recent', offset = 0, limit = 10 } = req.query;
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: sort === 'recent' ? 'desc' : 'asc' },
      skip: parseInt(offset),
      take: parseInt(limit),
      select: { id: true, title: true, content: true, createdAt: true },
    });
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

// Article 상세 조회 API
export const getArticleById = async (req, res, next) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    next(err);
  }
};

/// Article 수정 API
export const updateArticle = async (req, res, next) => {
  try {
    const updated = await prisma.article.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Article not found' });
    }
    next(err);
  }
};

// Article 삭제 API
export const deleteArticle = async (req, res, next) => {
  try {
    await prisma.article.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Article not found' });
    }
    next(err);
  }
};
