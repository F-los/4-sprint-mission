import { ProductsRepository } from './products.repository';
import { Product, ProductWithCounts, CreateProductDto, UpdateProductDto } from './products.types';

export class ProductsService {
  constructor(private repository: ProductsRepository) {}

  async getProducts(limit: number = 10, offset: number = 0): Promise<ProductWithCounts[]> {
    return await this.repository.findAll(limit, offset);
  }

  async getProductById(id: number): Promise<ProductWithCounts | null> {
    return await this.repository.findById(id);
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    return await this.repository.create(productData);
  }

  async updateProduct(id: number, productData: UpdateProductDto, userId: number): Promise<Product | null> {
    const hasPermission = await this.repository.checkOwnership(id, userId);
    if (!hasPermission) {
      throw new Error('해당 상품을 수정할 권한이 없습니다.');
    }
    return await this.repository.update(id, productData);
  }

  async deleteProduct(id: number, userId: number): Promise<boolean> {
    const hasPermission = await this.repository.checkOwnership(id, userId);
    if (!hasPermission) {
      throw new Error('해당 상품을 삭제할 권한이 없습니다.');
    }
    return await this.repository.delete(id);
  }

  async toggleLike(productId: number, userId: number): Promise<{ liked: boolean }> {
    const isLiked = await this.repository.checkLike(userId, productId);

    if (isLiked) {
      await this.repository.removeLike(userId, productId);
      return { liked: false };
    } else {
      await this.repository.addLike(userId, productId);
      return { liked: true };
    }
  }
}
