// src/services/notification.service.ts
import { NotificationRepository } from '../repositories/notification.repository.js';
import { Server } from 'socket.io';
import { sendNotificationToUser } from '../socket.js';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createNotification(
    io: Server,
    data: {
      userId: number;
      type: string;
      message: string;
      productId?: number;
      articleId?: number;
      commentId?: number;
    },
  ) {
    const notification = await this.notificationRepository.create(data);

    // Send real-time notification via Socket.IO
    sendNotificationToUser(io, data.userId, {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async getNotifications(userId: number, limit = 20, offset = 0) {
    return await this.notificationRepository.findByUserId(userId, limit, offset);
  }

  async getUnreadCount(userId: number) {
    return await this.notificationRepository.countUnreadByUserId(userId);
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await this.notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: number) {
    return await this.notificationRepository.markAllAsRead(userId);
  }
}
