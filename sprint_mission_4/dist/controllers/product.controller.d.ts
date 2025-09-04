import { Request, Response, NextFunction } from 'express';
import { CreateProductRequest } from '../types/index.js';
export declare const createProduct: (req: Request<{}, {}, CreateProductRequest>, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllProducts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductById: (req: Request<{
    id: string;
}>, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: Request<{
    id: string;
}>, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: Request<{
    id: string;
}>, res: Response, next: NextFunction) => Promise<void>;
