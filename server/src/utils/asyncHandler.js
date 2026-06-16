// src/utils/asyncHandler.js

// This is a Higher Order Function — it wraps an async function
// and automatically forwards any thrown errors to next(err)
// so the global error handler catches them.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;