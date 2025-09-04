// main.ts
import app from './src/app.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const port: number = parseInt(process.env.PORT || '3000', 10);

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
