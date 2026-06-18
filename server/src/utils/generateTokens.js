// src/utils/generateTokens.js
const jwt = require('jsonwebtoken');

// Access token — short-lived, sent with every request
// Payload kept minimal: just enough to identify and authorize the user
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      employee: user.employee, // employee profile ID
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

// Refresh token — long-lived, minimal payload (just user ID)
// Never put sensitive data here — it lives longer and has wider exposure
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET, // DIFFERENT secret from access token
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };