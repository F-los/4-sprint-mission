import { Router } from 'express';
import { PostsController } from './posts.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export function createPostsRouter(controller: PostsController): Router {
  const router = Router();

  // Public routes
  router.get('/', controller.getPosts);
  router.get('/:id', controller.getPostById);

  // Protected routes
  router.post('/', authMiddleware, controller.createPost);
  router.patch('/:id', authMiddleware, controller.updatePost);
  router.delete('/:id', authMiddleware, controller.deletePost);
  router.post('/:id/like', authMiddleware, controller.toggleLike);

  return router;
}
