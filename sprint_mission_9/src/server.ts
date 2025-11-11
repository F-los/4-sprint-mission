import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app, pool } from './app';
import { NotificationsSocket, notificationsService } from './features/notifications';

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Initialize Socket.IO for notifications
new NotificationsSocket(io, notificationsService);

// PostgreSQL LISTEN for notifications
async function startListening() {
  const client = await pool.connect();

  await client.query(`
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

  await client.query(`
    DROP TRIGGER IF EXISTS trg_notify_new_notification ON notifications;
    CREATE TRIGGER trg_notify_new_notification
      AFTER INSERT ON notifications
      FOR EACH ROW
      EXECUTE FUNCTION notify_new_notification();
  `);

  await client.query('LISTEN new_notification');

  client.on('notification', (msg) => {
    if (msg.payload) {
      const notification = JSON.parse(msg.payload);
      io.to(`user-${notification.user_id}`).emit('new_notification', {
        notification: notification
      });
    }
  });

  console.log('PostgreSQL LISTEN 설정 완료');
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  await startListening();
});
