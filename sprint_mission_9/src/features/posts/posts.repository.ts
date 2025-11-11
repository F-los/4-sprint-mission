import { Pool } from 'pg';
import { Post, PostWithCounts, CreatePostDto, UpdatePostDto } from './posts.types';

export class PostsRepository {
  constructor(private pool: Pool) {}

  async findAll(limit: number = 10, offset: number = 0): Promise<PostWithCounts[]> {
    const result = await this.pool.query(
      `SELECT p.*, u.nickname as author_nickname,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async findById(id: number): Promise<PostWithCounts | null> {
    const result = await this.pool.query(
      `SELECT p.*, u.nickname as author_nickname,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(postData: CreatePostDto): Promise<Post> {
    const result = await this.pool.query(
      `INSERT INTO posts (board_id, author_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [postData.board_id || 1, postData.author_id, postData.title, postData.content]
    );
    return result.rows[0];
  }

  async update(id: number, postData: UpdatePostDto): Promise<Post | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(postData).forEach(([key, value]) => {
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
      `UPDATE posts SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM posts WHERE id = $1', [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async checkOwnership(postId: number, userId: number): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT id FROM posts WHERE id = $1 AND author_id = $2',
      [postId, userId]
    );
    return result.rows.length > 0;
  }

  private async findByIdRaw(id: number): Promise<Post | null> {
    const result = await this.pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Like operations
  async checkLike(userId: number, postId: number): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    return result.rows.length > 0;
  }

  async addLike(userId: number, postId: number): Promise<void> {
    await this.pool.query(
      'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
      [userId, postId]
    );
  }

  async removeLike(userId: number, postId: number): Promise<void> {
    await this.pool.query(
      'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
  }
}
