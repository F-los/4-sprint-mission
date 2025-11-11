import { Pool } from 'pg';
import { User, UserResponse, RegisterDto } from './users.types';

export class UsersRepository {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<UserResponse | null> {
    const result = await this.pool.query(
      'SELECT id, email, nickname, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(userData: RegisterDto): Promise<UserResponse> {
    const result = await this.pool.query(
      `INSERT INTO users (email, password_hash, nickname)
       VALUES ($1, $2, $3)
       RETURNING id, email, nickname, created_at`,
      [userData.email, userData.password, userData.nickname]
    );
    return result.rows[0];
  }

  async findByEmailAndPassword(email: string, password: string): Promise<UserResponse | null> {
    const result = await this.pool.query(
      'SELECT id, email, nickname FROM users WHERE email = $1 AND password_hash = $2',
      [email, password]
    );
    return result.rows[0] || null;
  }
}
