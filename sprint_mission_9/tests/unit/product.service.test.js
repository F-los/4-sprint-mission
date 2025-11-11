// 상품 비즈니스 로직 유닛 테스트 (Mock, Spy 활용)

describe('Product Service - Unit Tests with Mock & Spy', () => {
  let mockPool;
  let productService;

  beforeEach(() => {
    // Mock database pool
    mockPool = {
      query: jest.fn()
    };

    // Simple product service functions
    productService = {
      async getProductById(id) {
        const result = await mockPool.query(
          'SELECT * FROM products WHERE id = $1',
          [id]
        );
        return result.rows[0];
      },

      async createProduct(product) {
        const { seller_id, name, description, price } = product;
        const result = await mockPool.query(
          'INSERT INTO products (seller_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
          [seller_id, name, description, price]
        );
        return result.rows[0];
      },

      async likeProduct(user_id, product_id) {
        // Check if product exists
        const productResult = await mockPool.query(
          'SELECT id FROM products WHERE id = $1',
          [product_id]
        );

        if (productResult.rows.length === 0) {
          throw new Error('Product not found');
        }

        // Check if already liked
        const likeCheck = await mockPool.query(
          'SELECT * FROM product_likes WHERE user_id = $1 AND product_id = $2',
          [user_id, product_id]
        );

        if (likeCheck.rows.length > 0) {
          // Unlike
          await mockPool.query(
            'DELETE FROM product_likes WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
          );
          return { liked: false };
        } else {
          // Like
          await mockPool.query(
            'INSERT INTO product_likes (user_id, product_id) VALUES ($1, $2)',
            [user_id, product_id]
          );
          return { liked: true };
        }
      }
    };
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: '10000'
      };

      mockPool.query.mockResolvedValue({
        rows: [mockProduct]
      });

      const result = await productService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM products WHERE id = $1',
        [1]
      );
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should return undefined when product not found', async () => {
      mockPool.query.mockResolvedValue({
        rows: []
      });

      const result = await productService.getProductById(999);

      expect(result).toBeUndefined();
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('createProduct', () => {
    it('should create and return new product', async () => {
      const newProduct = {
        seller_id: 1,
        name: 'New Product',
        description: 'Description',
        price: 20000
      };

      const createdProduct = {
        id: 10,
        ...newProduct
      };

      mockPool.query.mockResolvedValue({
        rows: [createdProduct]
      });

      const result = await productService.createProduct(newProduct);

      expect(result).toEqual(createdProduct);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO products (seller_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [newProduct.seller_id, newProduct.name, newProduct.description, newProduct.price]
      );
    });

    it('should call database query exactly once', async () => {
      const spy = jest.spyOn(mockPool, 'query');

      mockPool.query.mockResolvedValue({
        rows: [{ id: 1 }]
      });

      await productService.createProduct({
        seller_id: 1,
        name: 'Test',
        description: 'Test',
        price: 1000
      });

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });

  describe('likeProduct', () => {
    it('should like a product when not already liked', async () => {
      // Mock product exists
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      // Mock no existing like
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      // Mock insert success
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await productService.likeProduct(1, 1);

      expect(result).toEqual({ liked: true });
      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });

    it('should unlike a product when already liked', async () => {
      // Mock product exists
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      // Mock existing like
      mockPool.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, product_id: 1 }]
      });

      // Mock delete success
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      const result = await productService.likeProduct(1, 1);

      expect(result).toEqual({ liked: false });
      expect(mockPool.query).toHaveBeenCalledTimes(3);
    });

    it('should throw error when product not found', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: []
      });

      await expect(productService.likeProduct(1, 999))
        .rejects
        .toThrow('Product not found');

      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should use spy to track query calls', async () => {
      const spy = jest.spyOn(mockPool, 'query');

      // Setup mocks
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      mockPool.query.mockResolvedValueOnce({ rows: [] });
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await productService.likeProduct(1, 1);

      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy).toHaveBeenNthCalledWith(1,
        'SELECT id FROM products WHERE id = $1',
        [1]
      );
      expect(spy).toHaveBeenNthCalledWith(2,
        'SELECT * FROM product_likes WHERE user_id = $1 AND product_id = $2',
        [1, 1]
      );

      spy.mockRestore();
    });
  });
});
