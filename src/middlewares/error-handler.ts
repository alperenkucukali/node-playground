import { ErrorRequestHandler } from 'express';
import ApiError from '../utils/api-error';
import logger from '../config/logger';

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const error = err instanceof ApiError ? err : ApiError.internal();
  const status = error.statusCode || 500;

  if (!error.isOperational) {
    logger.error('Unexpected error', { err });
  }

  res.status(status).json({
    success: false,
    message: error.message,
    details: error.details,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
