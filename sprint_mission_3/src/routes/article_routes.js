// src/routes/article.routes.js
import express from 'express';
import * as articleController from '../controllers/article_controller.js';
import { validateArticle } from '../middlewares/validation.js';

const router = express.Router();

router
  .route('/')
  .post(validateArticle, articleController.createArticle)
  .get(articleController.getAllArticles);

router
  .route('/:id')
  .get(articleController.getArticleById)
  .patch(validateArticle, articleController.updateArticle)
  .delete(articleController.deleteArticle);

export default router;
