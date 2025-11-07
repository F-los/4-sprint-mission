// src/routes/notification.routes.ts
import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = Router();
const notificationController = new NotificationController();

// Get all notifications for the authenticated user
router.get('/', authenticateToken, notificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);

// Mark a specific notification as read
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticateToken, notificationController.markAllAsRead);

export default router;
