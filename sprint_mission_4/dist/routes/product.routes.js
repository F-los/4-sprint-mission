// src/routes/product.routes.js
import express from 'express';
import * as productController from '../controllers/product.controller.js';
import { validateProduct, validateProductPatch, } from '../middlewares/validation.js';
const router = express.Router();
router
    .route('/')
    .post(validateProduct, productController.createProduct)
    .get(productController.getAllProducts);
router
    .route('/:id')
    .get(productController.getProductById)
    .patch(validateProductPatch, productController.updateProduct)
    .delete(productController.deleteProduct);
export default router;
//# sourceMappingURL=product.routes.js.map