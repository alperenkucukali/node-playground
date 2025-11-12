import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';

function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
}

export default requestLogger;
