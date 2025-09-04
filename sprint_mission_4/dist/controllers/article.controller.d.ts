import { Request, Response, NextFunction } from 'express';
import { CreateArticleRequest, UpdateArticleRequest } from '../types/index.js';
export declare const createArticle: (req: Request<{}, {}, CreateArticleRequest>, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllArticles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getArticleById: (req: Request<{
    id: string;
}>, res: Response, next: NextFunction) => Promise<void>;
export declare const updateArticle: (req: Request<{
    id: string;
}, {}, UpdateArticleRequest>, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteArticle: (req: Request<{
    id: string;
}>, res: Response, next: NextFunction) => Promise<void>;
