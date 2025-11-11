import pool from '../../shared/database/pool';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { createProductsRouter } from './products.routes';

// Initialize Products feature
const productsRepository = new ProductsRepository(pool);
const productsService = new ProductsService(productsRepository);
const productsController = new ProductsController(productsService);
export const productsRouter = createProductsRouter(productsController);

export * from './products.types';
export { ProductsRepository, ProductsService, ProductsController };
