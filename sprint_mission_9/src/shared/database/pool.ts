import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'panda_market',
  user: process.env.DB_USER || 'panda_user',
  password: process.env.DB_PASSWORD || 'panda1234',
});

export default pool;
