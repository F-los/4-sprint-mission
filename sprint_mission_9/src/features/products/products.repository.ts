import { Pool } from 'pg';
import { Product, ProductWithCounts, CreateProductDto, UpdateProductDto } from './products.types';

export class ProductsRepository {
  constructor(private pool: Pool) {}

  async findAll(limit: number = 10, offset: number = 0): Promise<ProductWithCounts[]> {
    const result = await this.pool.query(
      `SELECT p.*, u.nickname as seller_nickname,
              (SELECT COUNT(*) FROM product_likes WHERE product_id = p.id) as like_count,
              (SELECT COUNT(*) FROM product_comments WHERE product_id = p.id) as comment_count
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.status = 'FOR_SALE'
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async findById(id: number): Promise<ProductWithCounts | null> {
    const result = await this.pool.query(
      `SELECT p.*, u.nickname as seller_nickname,
              (SELECT COUNT(*) FROM product_likes WHERE product_id = p.id) as like_count,
              (SELECT COUNT(*) FROM product_comments WHERE product_id = p.id) as comment_count
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(productData: CreateProductDto): Promise<Product> {
    const result = await this.pool.query(
      `INSERT INTO products (seller_id, name, description, price, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        productData.seller_id,
        productData.name,
        productData.description,
        productData.price,
        productData.category_id,
        productData.image_url
      ]
    );
    return result.rows[0];
  }

  async update(id: number, productData: UpdateProductDto): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findByIdRaw(id);
    }

    values.push(id);
    const result = await this.pool.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async checkOwnership(productId: number, userId: number): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT id FROM products WHERE id = $1 AND seller_id = $2',
      [productId, userId]
    );
    return result.rows.length > 0;
  }

  private async findByIdRaw(id: number): Promise<Product | null> {
    const result = await this.pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Like operations
  async checkLike(userId: number, productId: number): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT * FROM product_likes WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    return result.rows.length > 0;
  }

  async addLike(userId: number, productId: number): Promise<void> {
    await this.pool.query(
      'INSERT INTO product_likes (user_id, product_id) VALUES ($1, $2)',
      [userId, productId]
    );
  }

  async removeLike(userId: number, productId: number): Promise<void> {
    await this.pool.query(
      'DELETE FROM product_likes WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
  }
}
