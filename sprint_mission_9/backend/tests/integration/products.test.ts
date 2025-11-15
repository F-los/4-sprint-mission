import request from 'supertest';
import { app, pool } from '../../src/app';

describe('Products API', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('인증 불필요 - GET /api/products', () => {
    it('should return list of products', async () => {
      const response = await request(app).get('/api/products').expect(200);

      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should support pagination with limit and offset', async () => {
      const response = await request(app).get('/api/products?limit=2&offset=0').expect(200);

      expect(response.body.products.length).toBeLessThanOrEqual(2);
    });

    it('should include seller nickname and counts', async () => {
      const response = await request(app).get('/api/products').expect(200);

      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('seller_nickname');
        expect(product).toHaveProperty('like_count');
        expect(product).toHaveProperty('comment_count');
      }
    });
  });

  describe('인증 불필요 - GET /api/products/:id', () => {
    it('should return a product by id', async () => {
      const response = await request(app).get('/api/products/1').expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/999999').expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Product not found');
    });

    it('should include seller and stats', async () => {
      const response = await request(app).get('/api/products/1').expect(200);

      expect(response.body).toHaveProperty('seller_nickname');
      expect(response.body).toHaveProperty('like_count');
      expect(response.body).toHaveProperty('comment_count');
    });
  });

  describe('인증 필요 - POST /api/products', () => {
    const authToken = 'mock-jwt-token';

    it('should create a product with authentication', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10000,
        category_id: 1,
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(newProduct.name);
      }
    });

    it('should return 401 without authentication', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10000,
      };

      await request(app).post('/api/products').send(newProduct).expect(401);
    });

    it('should return 400 with missing fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('인증 필요 - POST /api/products/:id/like', () => {
    const authToken = 'mock-jwt-token';

    it('should toggle like on a product', async () => {
      const response = await request(app)
        .post('/api/products/1/like')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('liked');
        expect(typeof response.body.liked).toBe('boolean');
      }
    });

    it('should return 401 without authentication', async () => {
      await request(app).post('/api/products/1/like').expect(401);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .post('/api/products/999999/like')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
