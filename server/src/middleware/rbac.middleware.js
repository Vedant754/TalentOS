// src/middleware/rbac.middleware.js
const AppError = require('../utils/AppError');

// Middleware FACTORY — takes allowed roles, returns a middleware
// Usage: authorize('ceo', 'hr_manager')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the 'protect' middleware (Phase 4) — must run first
    if (!req.user) {
      throw new AppError('Not authorized. Please log in.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `Role '${req.user.role}' is not permitted to perform this action`,
        403 // Forbidden — authenticated, just not allowed
      );
    }

    next();
  };
};

module.exports = { authorize };