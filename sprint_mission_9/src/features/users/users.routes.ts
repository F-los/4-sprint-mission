import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export function createUsersRouter(controller: UsersController): Router {
  const router = Router();

  // Auth routes (public)
  router.post('/auth/register', controller.register);
  router.post('/auth/login', controller.login);

  // User routes (protected)
  router.get('/me', authMiddleware, controller.getMe);

  return router;
}
