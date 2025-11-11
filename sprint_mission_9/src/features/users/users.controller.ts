import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { AuthRequest } from '../../shared/types';

export class UsersController {
  constructor(private service: UsersService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, nickname } = req.body;

      if (!email || !password || !nickname) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = await this.service.register({ email, password, nickname });
      res.status(201).json(result);
    } catch (error: any) {
      console.error('POST /api/auth/register error:', error);
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Missing email or password' });
        return;
      }

      const result = await this.service.login({ email, password });
      res.json(result);
    } catch (error: any) {
      console.error('POST /api/auth/login error:', error);
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  };

  getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await this.service.getUserById(req.userId!);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error: any) {
      console.error('GET /api/users/me error:', error);
      res.status(500).json({ error: error.message });
    }
  };
}
