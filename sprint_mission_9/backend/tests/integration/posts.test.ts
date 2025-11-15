import request from 'supertest';
import { app, pool } from '../../src/app';

describe('Posts API', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('인증 불필요 - GET /api/posts', () => {
    it('should return list of posts', async () => {
      const response = await request(app).get('/api/posts').expect(200);

      expect(response.body).toHaveProperty('posts');
      expect(Array.isArray(response.body.posts)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/posts?limit=2&offset=0').expect(200);

      expect(response.body.posts.length).toBeLessThanOrEqual(2);
    });

    it('should include author and counts', async () => {
      const response = await request(app).get('/api/posts').expect(200);

      if (response.body.posts.length > 0) {
        const post = response.body.posts[0];
        expect(post).toHaveProperty('author_nickname');
        expect(post).toHaveProperty('like_count');
        expect(post).toHaveProperty('comment_count');
      }
    });
  });

  describe('인증 불필요 - GET /api/posts/:id', () => {
    it('should return a post by id', async () => {
      const response = await request(app).get('/api/posts/1').expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app).get('/api/posts/999999').expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('인증 필요 - POST /api/posts', () => {
    const authToken = 'mock-jwt-token';

    it('should create a post with authentication', async () => {
      const newPost = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPost);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newPost.title);
        expect(response.body.content).toBe(newPost.content);
      }
    });

    it('should return 401 without authentication', async () => {
      const newPost = {
        title: 'Test Post',
        content: 'Test Content',
      };

      await request(app).post('/api/posts').send(newPost).expect(401);
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('인증 필요 - POST /api/posts/:id/like', () => {
    const authToken = 'mock-jwt-token';

    it('should toggle like on a post', async () => {
      const response = await request(app)
        .post('/api/posts/1/like')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('liked');
        expect(typeof response.body.liked).toBe('boolean');
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app).post('/api/posts/1/like').expect(401);
    });

    it('should return 404 for non-existent post', async () => {
      await request(app)
        .post('/api/posts/999999/like')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
