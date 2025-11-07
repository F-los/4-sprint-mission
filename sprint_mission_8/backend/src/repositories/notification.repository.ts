// src/repositories/notification.repository.ts
import prisma from '../prisma/client.js';

export class NotificationRepository {
  async create(data: {
    userId: number;
    type: string;
    message: string;
    productId?: number;
    articleId?: number;
    commentId?: number;
  }) {
    return await prisma.notification.create({
      data,
    });
  }

  async findByUserId(userId: number, limit = 20, offset = 0) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async countUnreadByUserId(userId: number) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: number, userId: number) {
    return await prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: number) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async findById(id: number) {
    return await prisma.notification.findUnique({
      where: { id },
    });
  }
}
