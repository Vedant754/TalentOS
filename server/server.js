// server.js
const dotenv = require('dotenv');
dotenv.config(); // Must be first — loads .env before anything else

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TalentOS API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
});