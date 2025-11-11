import { NotificationsRepository } from './notifications.repository';
import { Notification, CreateNotificationDto } from './notifications.types';

export class NotificationsService {
  constructor(private repository: NotificationsRepository) {}

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    return await this.repository.create(data);
  }

  async getUserNotifications(userId: number, limit?: number): Promise<Notification[]> {
    return await this.repository.findByUserId(userId, limit);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.repository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: number): Promise<void> {
    await this.repository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.repository.markAllAsRead(userId);
  }
}
