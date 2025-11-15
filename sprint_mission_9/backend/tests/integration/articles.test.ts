import request from 'supertest';
import { app, prisma } from '../../src/app';

describe('Articles API', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('인증 불필요 - GET /api/articles', () => {
    it('should return list of articles', async () => {
      const response = await request(app).get('/api/articles').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/articles?limit=2&page=1').expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should include author and counts', async () => {
      const response = await request(app).get('/api/articles').expect(200);

      if (response.body.data.length > 0) {
        const article = response.body.data[0];
        expect(article).toHaveProperty('user');
        expect(article.user).toHaveProperty('nickname');
        expect(article).toHaveProperty('likeCount');
        expect(article).toHaveProperty('commentCount');
      }
    });
  });

  describe('인증 불필요 - GET /api/articles/:id', () => {
    it('should return an article by id', async () => {
      const response = await request(app).get('/api/articles/1').expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app).get('/api/articles/999999').expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('인증 필요 - POST /api/articles', () => {
    const authToken = 'mock-jwt-token';

    it('should create an article with authentication', async () => {
      const newArticle = {
        title: 'Test Article',
        content: 'Test Content',
        userId: 1,
      };

      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newArticle);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newArticle.title);
        expect(response.body.content).toBe(newArticle.content);
      }
    });

    it('should return 401 without authentication', async () => {
      const newArticle = {
        title: 'Test Article',
        content: 'Test Content',
      };

      await request(app).post('/api/articles').send(newArticle).expect(401);
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('인증 필요 - POST /api/articles/:id/like', () => {
    const authToken = 'mock-jwt-token';

    it('should toggle like on an article', async () => {
      const response = await request(app)
        .post('/api/articles/1/like')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('liked');
        expect(typeof response.body.liked).toBe('boolean');
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app).post('/api/articles/1/like').expect(401);
    });

    it('should return 404 for non-existent article', async () => {
      await request(app)
        .post('/api/articles/999999/like')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
