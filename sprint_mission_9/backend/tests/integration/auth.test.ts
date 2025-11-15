import request from 'supertest';
import { app, prisma } from '../../src/app';

describe('Auth API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        nickname: `testuser${Date.now()}`,
      };

      const response = await request(app).post('/api/users/register').send(newUser).expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.nickname).toBe(newUser.nickname);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for duplicate email', async () => {
      const user = {
        email: 'duplicate@example.com',
        password: 'password123',
        nickname: 'duplicateuser',
      };

      // First registration
      await request(app).post('/api/users/register').send(user);

      // Try to register again with same email
      const response = await request(app).post('/api/users/register').send(user).expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/users/login', () => {
    // Create a test user first
    beforeAll(async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
          nickname: 'logintest',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('logintest@example.com');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
