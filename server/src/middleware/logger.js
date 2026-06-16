// src/middleware/logger.js

const logger = (req, res, next) => {
  const start = Date.now();

  // We hook into the response 'finish' event so we can log
  // AFTER the response has been sent — only then do we know the status code
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`;

    // Color-code by status in development
    if (process.env.NODE_ENV === 'development') {
      const color = res.statusCode >= 500 ? '\x1b[31m'  // red
                  : res.statusCode >= 400 ? '\x1b[33m'  // yellow
                  : res.statusCode >= 200 ? '\x1b[32m'  // green
                  : '\x1b[0m';
      console.log(`${color}${log}\x1b[0m`);
    }
  });

  next(); // CRITICAL — must call next() or the request hangs
};

module.exports = logger;