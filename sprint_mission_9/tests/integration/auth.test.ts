import request from 'supertest';
import { app, pool } from '../../src/app';

describe('Auth API', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        nickname: `testuser${Date.now()}`,
      };

      const response = await request(app).post('/api/auth/register').send(newUser).expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.nickname).toBe(newUser.nickname);
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Missing required fields');
    });

    it('should return 409 for duplicate email', async () => {
      const user = {
        email: 'duplicate@example.com',
        password: 'password123',
        nickname: 'duplicateuser',
      };

      // First registration
      await request(app).post('/api/auth/register').send(user);

      // Try to register again with same email
      const response = await request(app).post('/api/auth/register').send(user).expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Email or nickname already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    // Create a test user first
    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
          nickname: 'logintest',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('logintest@example.com');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Missing email or password');
    });
  });
});
