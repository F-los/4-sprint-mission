import { Request, Response } from 'express';
import { PostsService } from './posts.service';
import { AuthRequest } from '../../shared/types';

export class PostsController {
  constructor(private service: PostsService) {}

  getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const posts = await this.service.getPosts(Number(limit), Number(offset));
      res.json({ posts });
    } catch (error: any) {
      console.error('GET /api/posts error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const post = await this.service.getPostById(Number(id));

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json(post);
    } catch (error: any) {
      console.error('GET /api/posts/:id error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  createPost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, content, board_id = 1 } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const post = await this.service.createPost({
        board_id,
        author_id: req.userId!,
        title,
        content
      });

      res.status(201).json(post);
    } catch (error: any) {
      console.error('POST /api/posts error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const post = await this.service.updatePost(Number(id), req.body, req.userId!);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json(post);
    } catch (error: any) {
      console.error('PATCH /api/posts/:id error:', error);
      if (error.message.includes('권한')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.service.deletePost(Number(id), req.userId!);

      if (!deleted) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      console.error('DELETE /api/posts/:id error:', error);
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

      // Check if post exists
      const post = await this.service.getPostById(Number(id));
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      const result = await this.service.toggleLike(Number(id), req.userId!);
      res.json(result);
    } catch (error: any) {
      console.error('POST /api/posts/:id/like error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}
