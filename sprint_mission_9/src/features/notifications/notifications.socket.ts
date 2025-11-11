import { Server as SocketIOServer, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

export class NotificationsSocket {
  constructor(
    private io: SocketIOServer,
    private service: NotificationsService
  ) {
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('클라이언트 연결됨:', socket.id);

      socket.on('authenticate', async (userId: number) => {
        await this.handleAuthenticate(socket, userId);
      });

      socket.on('get_notifications', async (userId: number) => {
        await this.handleGetNotifications(socket, userId);
      });

      socket.on('mark_read', async (notificationId: number) => {
        await this.handleMarkRead(socket, notificationId);
      });

      socket.on('mark_all_read', async (userId: number) => {
        await this.handleMarkAllRead(socket, userId);
      });

      socket.on('disconnect', () => {
        const userId = (socket as any).userId;
        if (userId) {
          console.log(`유저 ${userId} 연결 해제`);
        }
      });
    });
  }

  private async handleAuthenticate(socket: Socket, userId: number) {
    socket.join(`user-${userId}`);
    (socket as any).userId = userId;
    console.log(`유저 ${userId} 인증 완료`);

    const count = await this.service.getUnreadCount(userId);
    socket.emit('unread_count', { count });
  }

  private async handleGetNotifications(socket: Socket, userId: number) {
    const notifications = await this.service.getUserNotifications(userId, 20);
    socket.emit('notifications_list', { notifications });
  }

  private async handleMarkRead(socket: Socket, notificationId: number) {
    await this.service.markAsRead(notificationId);
    socket.emit('marked_read', { notificationId });
  }

  private async handleMarkAllRead(socket: Socket, userId: number) {
    await this.service.markAllAsRead(userId);
    socket.emit('all_marked_read');
  }

  // Method to emit new notification to specific user
  emitNotificationToUser(userId: number, notification: any) {
    this.io.to(`user-${userId}`).emit('new_notification', { notification });
  }
}
