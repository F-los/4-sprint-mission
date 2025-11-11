import { UsersRepository } from './users.repository';
import { RegisterDto, LoginDto, AuthResponse, UserResponse } from './users.types';

export class UsersService {
  constructor(private repository: UsersRepository) {}

  async register(userData: RegisterDto): Promise<{ user: UserResponse }> {
    // Check if email or nickname already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email or nickname already exists');
    }

    const user = await this.repository.create(userData);
    return { user };
  }

  async login(loginData: LoginDto): Promise<AuthResponse> {
    const user = await this.repository.findByEmailAndPassword(
      loginData.email,
      loginData.password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In production, generate a real JWT token
    return {
      user,
      token: 'mock-jwt-token'
    };
  }

  async getUserById(id: number): Promise<UserResponse | null> {
    return await this.repository.findById(id);
  }
}
