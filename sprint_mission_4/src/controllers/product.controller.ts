// src/controllers/product.controller.js
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client.js';
import { CreateProductRequest } from '../types/index.js';

// 상품 생성 API
export const createProduct = async (req: Request<{}, {}, CreateProductRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, price, tags, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        tags,
        imageUrl: imageUrl || null,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// 상품 목록 조회 API
export const getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const offset = Math.max(0, parseInt(req.query['offset'] as string ?? '0', 10) || 0);
    const limitRaw = parseInt(req.query['limit'] as string ?? '10', 10);
    const limit = Math.min(50, Math.max(1, limitRaw || 10)); // 1~50로 클램프
    const search = ((req.query['search'] as string) ?? '').trim();
    const sort = req.query['sort'] as string;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderBy = sort === 'recent' ? { createdAt: 'desc' as const } : {};

    const products = await prisma.product.findMany({
      skip: offset,
      take: limit,
      where,
      ...(Object.keys(orderBy).length > 0 && { orderBy }),
      select: { id: true, name: true, price: true, createdAt: true },
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// 상품 상세 조회 API
export const getProductById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
        imageUrl: true,
      },
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// 상품 수정 API
export const updateProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    next(err);
  }
};

// 상품 삭제 API
export const deleteProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    next(err);
  }
};
