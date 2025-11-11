const ApiError = require('../utils/api-error');
const logger = require('../config/logger');

function errorHandler(err, req, res, _next) {
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
}

module.exports = errorHandler;
