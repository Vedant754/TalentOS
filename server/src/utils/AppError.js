// src/utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;