// src/app.js
import express, { Application } from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes.js';
import articleRoutes from './routes/article.routes.js';
import commentRoutes from './routes/comment.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import userRoutes from './routes/user.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app: Application = express();

// CORS 설정
const corsOptions = {
  origin: [
    'http://localhost:3001', // 개발 환경
    'https://4-sprint-mission.vercel.app' // 프로덕션 환경
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// 기본 미들웨어
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// 라우터 연결
app.use('/products', productRoutes);
app.use('/articles', articleRoutes);
app.use('/comments', commentRoutes);
app.use('/upload', uploadRoutes);
app.use('/users', userRoutes);

// 에러 핸들러
app.use(errorHandler);

export default app;
