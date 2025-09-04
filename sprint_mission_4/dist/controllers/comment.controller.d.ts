import { Request, Response, NextFunction } from 'express';
import { CreateCommentRequest, UpdateCommentRequest } from '../types/index.js';
export declare const createProductComment: (req: Request<{
    productId: string;
}, {}, CreateCommentRequest>, res: Response, next: NextFunction) => Promise<void>;
export declare const createArticleComment: (req: Request<{
    articleId: string;
}, {}, CreateCommentRequest>, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductComments: (req: Request<{
    productId: string;
}>, res: Response, next: NextFunction) => Promise<void>;
export declare const getArticleComments: (req: Request<{
    articleId: string;
}>, res: Response, next: NextFunction) => Promise<void>;
export declare const updateComment: (req: Request<{
    id: string;
}, {}, UpdateCommentRequest>, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteComment: (req: Request<{
    id: string;
}>, res: Response, next: NextFunction) => Promise<void>;
