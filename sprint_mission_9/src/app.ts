import express, { Application } from 'express';
import { productsRouter } from './features/products';
import { postsRouter } from './features/posts';
import { usersRouter } from './features/users';
import { notificationsController } from './features/notifications';
import { errorHandler } from './shared/middlewares/error.middleware';
import pool from './shared/database/pool';

const app: Application = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/auth', usersRouter);
app.use('/api', usersRouter); // For /api/users/me

// Test notification endpoint
app.post('/api/test-notification', notificationsController.createTestNotification);

// Error handler
app.use(errorHandler);

export { app, pool };
