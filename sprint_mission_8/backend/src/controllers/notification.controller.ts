// src/controllers/notification.controller.ts
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = (req as any).user.userId;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const notifications = await this.notificationService.getNotifications(
        userId,
        limit,
        offset,
      );

      res.json({
        notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;

      const count = await this.notificationService.getUnreadCount(userId);

      res.json({
        count,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const notificationId = parseInt(req.params.id);

      await this.notificationService.markAsRead(notificationId, userId);

      res.json({
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;

      await this.notificationService.markAllAsRead(userId);

      res.json({
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  };
}
