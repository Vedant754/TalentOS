// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const logger = require('./middleware/logger');
const requestContext = require('./middleware/requestContext');
const { apiLimiter } = require('./middleware/rateLimiter');
const multer = require('multer');

const app = express();

// ─── 1. Security Middleware (first — reject bad requests early) ──────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── 2. Rate Limiting (before body parsing — don't waste CPU on blocked IPs)
app.use('/api/', apiLimiter);

// ─── 3. Request Context (attach requestId early so all logs can reference it)
app.use(requestContext);

// ─── 4. Logging ───────────────────
app.use(morgan('dev'));
app.use(logger);
app.use(cookieParser());
// ─── 5. Body Parsing ──────────────
app.use(express.json({ limit: '10kb' })); // Reject payloads over 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── 6. Static Files (for profile photo uploads in Phase 6) ─────────────────
// app.use('/uploads', express.static('uploads'));
// src/app.js — update the static file serving line
// app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
//   dotfiles: 'deny',        // never serve hidden files like .env if one ends up in that folder
//   index: false,            // don't auto-serve a directory listing
//   setHeaders: (res) => {
//     res.setHeader('X-Content-Type-Options', 'nosniff'); // browser won't guess content-type
//   },
// }));

// ─── 7. Routes ───────────────────
app.use('/api', require('./routes/index'));

// ─── 8. Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    requestId: req.requestId,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── 9. 404 Handler ──────────────────────────────────────────────────────────
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     requestId: req.requestId,
//     message: `Cannot ${req.method} ${req.originalUrl}`
//   });
// });

// ─── 10. Global Error Handler (MUST be last, MUST have 4 params) ─────────────
// Express knows this is an error handler because of the 4th parameter (err)
app.use((err, req, res, next) => {
  console.error(`[${req.requestId}] Error:`, err.stack);

  // Multer-specific errors need friendly translation
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE')  message = 'File is too large';
    if (err.code === 'LIMIT_FILE_COUNT') message = 'Too many files uploaded';
    if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Unexpected file field';

    return res.status(400).json({
      success: false,
      requestId: req.requestId,
      message,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    requestId: req.requestId,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});


app.all("/*splat", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;