// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── protect: verifies the access token and attaches req.user ────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Standard convention: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. Please log in.', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Distinguish expired vs malformed — frontend uses this to decide
    // whether to silently call /refresh or force a full logout
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }
    throw new AppError('Invalid token', 401);
  }

  // Confirm the user still exists and is active —
  // a deleted/deactivated user shouldn't be able to use an old valid token
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User no longer exists', 401);
  if (!user.isActive) throw new AppError('Account has been deactivated', 403);

  // Attach to req — every downstream middleware and controller can use req.user
  req.user = {
    id: user._id,
    role: user.role,
    employee: user.employee,
  };

  next();
});

module.exports = { protect };