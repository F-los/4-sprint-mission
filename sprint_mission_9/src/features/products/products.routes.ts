import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';

export function createProductsRouter(controller: ProductsController): Router {
  const router = Router();

  // Public routes
  router.get('/', controller.getProducts);
  router.get('/:id', controller.getProductById);

  // Protected routes
  router.post('/', authMiddleware, controller.createProduct);
  router.patch('/:id', authMiddleware, controller.updateProduct);
  router.delete('/:id', authMiddleware, controller.deleteProduct);
  router.post('/:id/like', authMiddleware, controller.toggleLike);

  return router;
}
