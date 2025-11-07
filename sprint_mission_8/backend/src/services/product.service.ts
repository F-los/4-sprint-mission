import { ProductRepository, LikeRepository } from '../repositories/index.js';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductWithLikeStatusDto,
  ProductListResponseDto,
  ProductQueryDto,
} from '../dto/index.js';
import { NotificationService } from './notification.service.js';
import { Server } from 'socket.io';

export class ProductService {
  private notificationService: NotificationService;

  constructor(
    private productRepository: ProductRepository,
    private likeRepository: LikeRepository,
  ) {
    this.notificationService = new NotificationService();
  }

  async createProduct(
    productData: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productRepository.create(productData);
  }

  async getProductById(
    id: number,
    userId?: number,
  ): Promise<ProductWithLikeStatusDto | null> {
    const product = await this.productRepository.findByIdWithCounts(id);
    if (!product) return null;

    const isLiked = userId
      ? await this.likeRepository.checkProductLike(userId, id)
      : false;

    return {
      ...product,
      isLiked,
    };
  }

  async getProducts(
    query: ProductQueryDto,
    userId?: number,
  ): Promise<ProductListResponseDto> {
    const { products, totalCount } = await this.productRepository.findMany(
      query,
      userId,
    );

    if (!userId) {
      const productsWithLikeStatus = products.map((product) => ({
        ...product,
        isLiked: false,
      }));
      return { list: productsWithLikeStatus, totalCount };
    }

    const productIds = products.map((product) => product.id);
    const likeMap = await this.likeRepository.checkMultipleProductLikes(
      userId,
      productIds,
    );

    const productsWithLikeStatus = products.map((product) => ({
      ...product,
      isLiked: likeMap[product.id] || false,
    }));

    return { list: productsWithLikeStatus, totalCount };
  }

  async updateProduct(
    id: number,
    productData: UpdateProductDto,
    userId: number,
    io?: Server,
  ): Promise<ProductResponseDto> {
    const hasPermission = await this.productRepository.checkOwnership(
      id,
      userId,
    );
    if (!hasPermission) {
      throw new Error('해당 상품을 수정할 권한이 없습니다.');
    }

    // Get current product to check price change
    const currentProduct = await this.productRepository.findById(id);
    const updatedProduct = await this.productRepository.update(id, productData);

    // If price changed, notify users who liked the product
    if (
      io &&
      currentProduct &&
      productData.price &&
      currentProduct.price !== productData.price
    ) {
      const usersWhoLiked =
        await this.likeRepository.findUsersWhoLikedProduct(id);

      for (const like of usersWhoLiked) {
        const priceChange =
          productData.price > currentProduct.price ? '인상' : '인하';
        const message = `좋아요한 상품 "${updatedProduct.name}"의 가격이 ${currentProduct.price}원에서 ${productData.price}원으로 ${priceChange}되었습니다.`;

        await this.notificationService.createNotification(io, {
          userId: like.userId,
          type: 'PRICE_CHANGE',
          message,
          productId: id,
        });
      }
    }

    return updatedProduct;
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    const hasPermission = await this.productRepository.checkOwnership(
      id,
      userId,
    );
    if (!hasPermission) {
      throw new Error('해당 상품을 삭제할 권한이 없습니다.');
    }

    await this.productRepository.delete(id);
  }

  async toggleLike(
    productId: number,
    userId: number,
  ): Promise<{ isLiked: boolean }> {
    const existingLike = await this.likeRepository.findByUserAndProduct(
      userId,
      productId,
    );

    if (existingLike) {
      await this.likeRepository.deleteByUserAndProduct(userId, productId);
      return { isLiked: false };
    } else {
      await this.likeRepository.create({
        userId,
        productId,
      });
      return { isLiked: true };
    }
  }
}
