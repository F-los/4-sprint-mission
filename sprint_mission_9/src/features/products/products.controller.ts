import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { AuthRequest } from '../../shared/types';

export class ProductsController {
  constructor(private service: ProductsService) {}

  getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const products = await this.service.getProducts(Number(limit), Number(offset));
      res.json({ products });
    } catch (error: any) {
      console.error('GET /api/products error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.service.getProductById(Number(id));

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (error: any) {
      console.error('GET /api/products/:id error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, description, price, category_id, image_url } = req.body;

      if (!name || !description || !price) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const product = await this.service.createProduct({
        seller_id: req.userId!,
        name,
        description,
        price,
        category_id,
        image_url
      });

      res.status(201).json(product);
    } catch (error: any) {
      console.error('POST /api/products error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.service.updateProduct(Number(id), req.body, req.userId!);

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (error: any) {
      console.error('PATCH /api/products/:id error:', error);
      if (error.message.includes('권한')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.service.deleteProduct(Number(id), req.userId!);

      if (!deleted) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('DELETE /api/products/:id error:', error);
      if (error.message.includes('권한')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if product exists
      const product = await this.service.getProductById(Number(id));
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      const result = await this.service.toggleLike(Number(id), req.userId!);
      res.json(result);
    } catch (error: any) {
      console.error('POST /api/products/:id/like error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}
