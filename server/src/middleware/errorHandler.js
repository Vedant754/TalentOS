// src/middleware/errorHandler.js
const AppError = require('../utils/AppError');

// ─── Translator functions — each takes a raw error, returns a clean AppError ──

const handleCastError = (err) => {
  // Fires when MongoDB tries to cast something to an ObjectId and fails
  // e.g. GET /api/employees/not-a-valid-id
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400, 'INVALID_ID');
};

const handleValidationError = (err) => {
  // Mongoose's own schema validation failures (required, min, max, enum, etc.)
  // err.errors is an OBJECT keyed by field name — we flatten it into an array
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  const message = `Invalid input: ${errors.map(e => e.message).join('. ')}`;
  const appErr = new AppError(message, 422, 'VALIDATION_ERROR');
  appErr.errors = errors; // attach the field-by-field breakdown for the frontend form
  return appErr;
};

const handleDuplicateKeyError = (err) => {
  // MongoDB error code 11000 — a unique index was violated
  // err.keyValue is an object like { email: "priya@talentos.com" }
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(
    `${field} '${value}' is already in use`,
    409,
    'DUPLICATE_FIELD'
  );
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

const handleMulterError = (err) => {
  const messages = {
    LIMIT_FILE_SIZE: 'File is too large',
    LIMIT_FILE_COUNT: 'Too many files uploaded',
    LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
  };
  return new AppError(messages[err.code] || 'File upload error', 400, 'UPLOAD_ERROR');
};

// ─── Response shapers — one for dev, one for prod ────────────────────────────

const sendDevError = (err, req, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    requestId: req.requestId,
    errorCode: err.errorCode || 'SERVER_ERROR',
    message: err.message,
    ...(err.errors && { errors: err.errors }),
    stack: err.stack,        // full stack trace — only ever in development
    error: err,              // raw error object for deep debugging
  });
};

const sendProdError = (err, req, res) => {
  // Operational errors (ones we anticipated) → safe to show the real message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      requestId: req.requestId,
      errorCode: err.errorCode,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Programming errors / unknown bugs → NEVER leak details to the client
  // Log the real error server-side for you to investigate
  console.error('🔥 UNHANDLED ERROR:', err);
  res.status(500).json({
    success: false,
    requestId: req.requestId,
    errorCode: 'SERVER_ERROR',
    message: 'Something went wrong. Our team has been notified.',
  });
};

// ─── The actual middleware ────────────────────────────────────────────────────
const globalErrorHandler = (err, req, res, next) => {
  let error = err;
  // Mongoose/JWT/Multer errors don't have .isOperational — translate them first
  if (err.name === 'CastError')          error = handleCastError(err);
  if (err.name === 'ValidationError')    error = handleValidationError(err);
  if (err.code === 11000)                error = handleDuplicateKeyError(err);
  if (err.name === 'JsonWebTokenError')  error = handleJWTError();
  if (err.name === 'TokenExpiredError')  error = handleJWTExpiredError();
  if (err.name === 'MulterError')        error = handleMulterError(err);

  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, req, res);
  } else {
    sendProdError(error, req, res);
  }
};

module.exports = globalErrorHandler;