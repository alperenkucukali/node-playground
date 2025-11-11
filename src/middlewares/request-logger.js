const logger = require('../config/logger');

function requestLogger(req, _res, next) {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
}

module.exports = requestLogger;
