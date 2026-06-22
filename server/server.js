// server.js
const dotenv = require('dotenv');
dotenv.config(); // Must be first — loads .env before anything else

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (reason) => {
  console.error('🔥 UNHANDLED REJECTION:', reason);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Connect to MongoDB, then start the HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TalentOS API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
});