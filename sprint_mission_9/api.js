require('dotenv').config();
const express = require('express');
const {
  Pool
} = require('pg');

const app = express();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'panda_market',
  user: process.env.DB_USER || 'panda_user',
  password: process.env.DB_PASSWORD || 'panda1234',
});

app.use(express.static('public'));
app.use(express.json());

// Products API - 인증 불필요
app.get('/api/products', async (req, res) => {
  try {
    const {
      limit = 10, offset = 0
    } = req.query;
    const result = await pool.query(
      `SELECT p.*, u.nickname as seller_nickname,
              (SELECT COUNT(*) FROM product_likes WHERE product_id = p.id) as like_count,
              (SELECT COUNT(*) FROM product_comments WHERE product_id = p.id) as comment_count
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.status = 'FOR_SALE'
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({
      products: result.rows
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const result = await pool.query(
      `SELECT p.*, u.nickname as seller_nickname,
              (SELECT COUNT(*) FROM product_likes WHERE product_id = p.id) as like_count,
              (SELECT COUNT(*) FROM product_comments WHERE product_id = p.id) as comment_count
       FROM products p
       LEFT JOIN users u ON p.seller_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Posts API - 인증 불필요
app.get('/api/posts', async (req, res) => {
  try {
    const {
      limit = 10, offset = 0
    } = req.query;
    const result = await pool.query(
      `SELECT p.*, u.nickname as author_nickname,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({
      posts: result.rows
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const result = await pool.query(
      `SELECT p.*, u.nickname as author_nickname,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
              (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Auth API
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      email,
      password,
      nickname
    } = req.body;

    if (!email || !password || !nickname) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, nickname)
       VALUES ($1, $2, $3)
       RETURNING id, email, nickname, created_at`,
      [email, password, nickname] // Note: In production, hash the password!
    );

    res.status(201).json({
      user: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Email or nickname already exists'
      });
    }
    res.status(500).json({
      error: error.message
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing email or password'
      });
    }

    const result = await pool.query(
      `SELECT id, email, nickname FROM users WHERE email = $1 AND password_hash = $2`,
      [email, password] // Note: In production, compare hashed password!
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    res.json({
      user: result.rows[0],
      token: 'mock-jwt-token'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Auth middleware (simple mock)
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  const token = authHeader.substring(7);

  // Mock: In production, verify JWT token
  if (token === 'mock-jwt-token') {
    req.userId = 1; // Mock user ID
    next();
  } else {
    res.status(401).json({
      error: 'Invalid token'
    });
  }
};

// Products API - 인증 필요
app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id
    } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const result = await pool.query(
      `INSERT INTO products (seller_id, name, description, price, category_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.userId, name, description, price, category_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.post('/api/products/:id/like', authMiddleware, async (req, res) => {
  try {
    const {
      id
    } = req.params;

    const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const existingLike = await pool.query(
      'SELECT * FROM product_likes WHERE user_id = $1 AND product_id = $2',
      [req.userId, id]
    );

    if (existingLike.rows.length > 0) {
      await pool.query(
        'DELETE FROM product_likes WHERE user_id = $1 AND product_id = $2',
        [req.userId, id]
      );
      res.json({
        liked: false
      });
    } else {
      await pool.query(
        'INSERT INTO product_likes (user_id, product_id) VALUES ($1, $2)',
        [req.userId, id]
      );
      res.json({
        liked: true
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Posts API - 인증 필요
app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      content,
      board_id = 1
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const result = await pool.query(
      `INSERT INTO posts (board_id, author_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [board_id, req.userId, title, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.post('/api/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const {
      id
    } = req.params;

    // Check if post exists
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    // Toggle like
    const existingLike = await pool.query(
      'SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [req.userId, id]
    );

    if (existingLike.rows.length > 0) {
      await pool.query(
        'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
        [req.userId, id]
      );
      res.json({
        liked: false
      });
    } else {
      await pool.query(
        'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)',
        [req.userId, id]
      );
      res.json({
        liked: true
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Test notification endpoint
app.post('/api/test-notification', async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message
    } = req.body;

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)`,
      [userId, type, title, message]
    );

    res.json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = {
  app,
  pool
};