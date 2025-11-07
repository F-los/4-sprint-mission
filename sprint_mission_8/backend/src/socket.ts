// src/socket.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketData {
  userId?: number;
}

interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

export const initializeSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3001',
        'https://sprint-mission-f-los.vercel.app',
      ],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth['token'];

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env['JWT_SECRET'] || 'your-secret-key',
      ) as { userId: number };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.data.userId;
    console.log(`🔌 User ${userId} connected via Socket.IO`);

    // Join user's personal room for targeted notifications
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`🔌 User ${userId} disconnected`);
    });
  });

  return io;
};

export const sendNotificationToUser = (
  io: Server,
  userId: number,
  notification: {
    id: number;
    type: string;
    message: string;
    createdAt: Date;
  },
) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
