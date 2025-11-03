const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'panda_market',
  user: 'panda_user',
  password: 'panda1234',
});

const userConnections = new Map();

wss.on('connection', (ws) => {
  console.log('클라이언트 연결됨');

  ws.on('message', async (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === 'authenticate') {
        userConnections.set(data.userId, ws);
        console.log(`유저 ${data.userId} 인증 완료`);

        const result = await pool.query(
          'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
          [data.userId],
        );
        ws.send(
          JSON.stringify({
            type: 'unread_count',
            count: parseInt(result.rows[0].unread_count),
          }),
        );
      }

      if (data.type === 'get_notifications') {
        const result = await pool.query(
          `SELECT * FROM notifications
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 20`,
          [data.userId],
        );
        ws.send(
          JSON.stringify({
            type: 'notifications_list',
            notifications: result.rows,
          }),
        );
      }

      if (data.type === 'mark_read') {
        await pool.query(
          'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1',
          [data.notificationId],
        );
        ws.send(
          JSON.stringify({
            type: 'marked_read',
            notificationId: data.notificationId,
          }),
        );
      }

      if (data.type === 'mark_all_read') {
        await pool.query(
          'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = $1 AND is_read = FALSE',
          [data.userId],
        );
        ws.send(
          JSON.stringify({
            type: 'all_marked_read',
          }),
        );
      }
    } catch (err) {
      console.error('메시지 처리 오류:', err);
    }
  });

  ws.on('close', () => {
    for (const [userId, connection] of userConnections.entries()) {
      if (connection === ws) {
        userConnections.delete(userId);
        console.log(`유저 ${userId} 연결 해제`);
        break;
      }
    }
  });
});

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
    const notification = JSON.parse(msg.payload);
    const userWs = userConnections.get(notification.user_id);

    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(
        JSON.stringify({
          type: 'new_notification',
          notification: notification,
        }),
      );
    }
  });

  console.log('PostgreSQL LISTEN 설정 완료');
}

app.use(express.static('public'));
app.use(express.json());

app.post('/api/test-notification', async (req, res) => {
  const { userId, type, title, message } = req.body;

  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, $2, $3, $4)`,
    [userId, type, title, message],
  );

  res.json({ success: true });
});

server.listen(3000, async () => {
  console.log('✅ Server running on http://localhost:3000');
  await startListening();
});
