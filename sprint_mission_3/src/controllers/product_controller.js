// src/controllers/product.controller.js
import prisma from '../prisma/client.js';

// 상품 생성 API
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, tags, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        tags,
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// 상품 목록 조회 API
export const getAllProducts = async (req, res, next) => {
  try {
    const { q, sort = 'recent', offset = 0, limit = 10 } = req.query;
    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: sort === 'recent' ? 'desc' : 'asc' },
      skip: parseInt(offset),
      take: parseInt(limit),
      select: { id: true, name: true, price: true, createdAt: true },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// 상품 상세 조회 API
export const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
      },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// 상품 수정 API
export const updateProduct = async (req, res, next) => {
  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    next(err);
  }
};

// 상품 삭제 API
export const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    next(err);
  }
};
