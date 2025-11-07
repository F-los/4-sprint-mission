// main.ts
import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './socket.js';

const port: number = parseInt(process.env['PORT'] || '3000', 10);

const httpServer = createServer(app);
const io = initializeSocket(httpServer);

// Make io accessible to app
app.set('io', io);

httpServer.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`🔌 Socket.IO is ready for connections`);
});
