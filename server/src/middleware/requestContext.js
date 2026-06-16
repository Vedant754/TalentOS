// src/middleware/requestContext.js
const { v4: uuidv4 } = require('uuid'); // npm install uuid

const requestContext = (req, res, next) => {
  // Unique ID for every request — invaluable for debugging in production
  // Trace a specific request through all your logs with this ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Echo the request ID back in the response header
  // Frontend devs can then report this ID when filing bug reports
  res.setHeader('X-Request-Id', req.requestId);

  next();
};

module.exports = requestContext;