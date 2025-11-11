const ApiError = require('../utils/api-error');

function notFound(req, _res, next) {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
}

module.exports = notFound;
