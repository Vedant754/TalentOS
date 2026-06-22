// src/controllers/auth.controller.js
const User   = require('../models/User');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const jwt = require('jsonwebtoken');

// ─── Helper: send tokens consistently across login/refresh ───────────────────
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token on the user document
  // This lets us invalidate it server-side on logout (true revocation)
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // httpOnly cookie — JavaScript on the client CANNOT read this
  // This is what makes refresh tokens immune to XSS theft
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'none', // allow cross-site /localhost cookie use for refresh flow
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  res.status(statusCode).json({
    success: true,
    accessToken, // Client stores this in memory (React state/context), NOT localStorage
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      employee: user.employee,
    },
  });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────
// In production SaaS, this would be invite-only or admin-created.
// Open registration shown here for learning; Phase 5 locks this down by role.
const register = asyncHandler(async (req, res) => {
  const { email, password, employeeId } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new AppError('Employee profile not found', 404);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new AppError('An account with this email already exists', 409);

  const user = await User.create({
    email,
    password,           // pre-save hook in User model hashes this automatically
    role: employee.role, // role inherited from employee profile, not user input
    employee: employee._id,
  });

  await sendTokenResponse(user, 201, res);
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // .select('+password') — overrides the schema's select:false for this one query
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Deliberately vague error — don't reveal whether email exists (prevents enumeration attacks)
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact HR.', 403);
  }

  await user.recordLogin();
  await sendTokenResponse(user, 200, res);
});

// ─── POST /api/auth/refresh ────────────────────────────────────────────────
// Called automatically by the frontend when an access token expires
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError('No refresh token provided', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  // Confirm this exact refresh token is still the one stored on the user
  // This is what makes server-side logout/revocation actually work
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token has been revoked. Please log in again.', 401);
  }

  await sendTokenResponse(user, 200, res);
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // req.user comes from the authenticate middleware (Step 3 below)
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
// Frontend calls this on app load to check "am I logged in, and as who?"
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'employee',
    populate: { path: 'department', select: 'name' },
  });

  res.status(200).json({ success: true, data: user });
});

module.exports = { register, login, refresh, logout, getMe };