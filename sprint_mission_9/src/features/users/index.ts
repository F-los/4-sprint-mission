import pool from '../../shared/database/pool';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { createUsersRouter } from './users.routes';

// Initialize Users feature
const usersRepository = new UsersRepository(pool);
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);
export const usersRouter = createUsersRouter(usersController);

export * from './users.types';
export { UsersRepository, UsersService, UsersController };
