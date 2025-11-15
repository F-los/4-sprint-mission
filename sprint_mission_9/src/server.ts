import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PoolClient } from 'pg';
import { app, pool } from './app';
import { NotificationsSocket, notificationsService } from './features/notifications';
import { env } from './shared/config/env';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Initialize Socket.IO for notifications
new NotificationsSocket(io, notificationsService);

// Store client reference for cleanup
let listenClient: PoolClient | null = null;

// PostgreSQL LISTEN for notifications
async function startListening() {
  try {
    listenClient = await pool.connect();

    await listenClient.query(`
      CREATE OR REPLACE FUNCTION notify_new_notification()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM pg_notify(
          'new_notification',
          json_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'type', NEW.type,
            'title', NEW.title,
            'message', NEW.message,
            'product_id', NEW.product_id,
            'post_id', NEW.post_id,
            'created_at', NEW.created_at
          )::text
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await listenClient.query(`
      DROP TRIGGER IF EXISTS trg_notify_new_notification ON notifications;
      CREATE TRIGGER trg_notify_new_notification
        AFTER INSERT ON notifications
        FOR EACH ROW
        EXECUTE FUNCTION notify_new_notification();
    `);

    await listenClient.query('LISTEN new_notification');

    listenClient.on('notification', (msg) => {
      if (msg.payload) {
        try {
          const notification = JSON.parse(msg.payload);
          io.to(`user-${notification.user_id}`).emit('new_notification', {
            notification: notification
          });
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    });

    if (env.NODE_ENV === 'development') {
      console.log('PostgreSQL LISTEN 설정 완료');
    }
  } catch (error) {
    console.error('Failed to setup PostgreSQL LISTEN:', error);
    throw error;
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close server
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close Socket.IO
  io.close(() => {
    console.log('Socket.IO closed');
  });

  // Release LISTEN client
  if (listenClient) {
    try {
      await listenClient.query('UNLISTEN new_notification');
      listenClient.release();
      console.log('PostgreSQL LISTEN client released');
    } catch (error) {
      console.error('Error releasing LISTEN client:', error);
    }
  }

  // Close pool
  await pool.end();
  console.log('Database pool closed');

  process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

const PORT = env.PORT;

server.listen(PORT, async () => {
  if (env.NODE_ENV === 'development') {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  }
  await startListening();
});
