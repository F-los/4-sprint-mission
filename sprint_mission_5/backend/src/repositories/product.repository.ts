import { PrismaClient } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductWithCountsDto,
  ProductQueryDto,
} from '../dto/index.js';

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProductDto): Promise<ProductResponseDto> {
    return await this.prisma.product.create({
      data,
    });
  }

  async findById(id: number): Promise<ProductResponseDto | null> {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findByIdWithCounts(id: number): Promise<ProductWithCountsDto | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!product) return null;

    const { _count, ...productData } = product;
    return {
      ...productData,
      likeCount: _count.likes,
      commentCount: _count.comments,
    };
  }

  async findMany(
    query: ProductQueryDto,
    userId?: number,
  ): Promise<{
    products: ProductWithCountsDto[];
    totalCount: number;
  }> {
    const { page = 1, pageSize = 10, orderBy = 'recent', keyword } = query;
    const skip = (page - 1) * pageSize;

    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' as const } },
            {
              description: { contains: keyword, mode: 'insensitive' as const },
            },
          ],
        }
      : {};

    const orderByClause =
      orderBy === 'favorite'
        ? { likes: { _count: 'desc' as const } }
        : { createdAt: 'desc' as const };

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: orderByClause,
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsWithCounts = products.map((product) => {
      const { _count, ...productData } = product;
      return {
        ...productData,
        likeCount: _count.likes,
        commentCount: _count.comments,
      };
    });

    return {
      products: productsWithCounts,
      totalCount,
    };
  }

  async update(
    id: number,
    data: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async checkOwnership(id: number, userId: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { userId: true },
    });
    return product?.userId === userId;
  }
}
