// src/middlewares/validation.js

export const validateProduct = (req, res, next) => {
  const { name, description, price } = req.body;
  if (!name || !description || price == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res
      .status(400)
      .json({ error: 'Price must be a non-negative number' });
  }
  next();
};

export const validateArticle = (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  next();
};
