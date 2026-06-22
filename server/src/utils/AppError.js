

class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || this.constructor.deriveCode(statusCode);
    this.isOperational = true; // ALL AppErrors are operational by definition — we threw them on purpose
    Error.captureStackTrace(this, this.constructor);
  }

  static deriveCode(statusCode) {
    const map = {
      400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN',
      404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS', 500: 'SERVER_ERROR',
    };
    return map[statusCode] || 'ERROR';
  }
}

module.exports = AppError;