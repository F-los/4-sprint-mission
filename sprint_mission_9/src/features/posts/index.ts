import pool from '../../shared/database/pool';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { createPostsRouter } from './posts.routes';

// Initialize Posts feature
const postsRepository = new PostsRepository(pool);
const postsService = new PostsService(postsRepository);
const postsController = new PostsController(postsService);
export const postsRouter = createPostsRouter(postsController);

export * from './posts.types';
export { PostsRepository, PostsService, PostsController };
