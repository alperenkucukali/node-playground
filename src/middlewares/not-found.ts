import { NextFunction, Request, Response } from 'express';
import ApiError from '../utils/api-error';

function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}

export default notFound;
