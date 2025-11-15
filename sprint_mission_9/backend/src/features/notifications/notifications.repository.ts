import { Pool } from 'pg';
import { Notification, CreateNotificationDto } from './notifications.types';

export class NotificationsRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateNotificationDto): Promise<Notification> {
    const result = await this.pool.query(
      `INSERT INTO notifications (user_id, type, title, message, product_id, post_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.user_id, data.type, data.title, data.message, data.product_id, data.post_id]
    );
    return result.rows[0];
  }

  async findByUserId(userId: number, limit: number = 20): Promise<Notification[]> {
    const result = await this.pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  async getUnreadCount(userId: number): Promise<number> {
    const result = await this.pool.query(
      'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
    return parseInt(result.rows[0].unread_count);
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1',
      [notificationId]
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );
  }
}
