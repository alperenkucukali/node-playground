class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static notFound(message, details) {
    return new ApiError(404, message, details);
  }

  static conflict(message, details) {
    return new ApiError(409, message, details);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
