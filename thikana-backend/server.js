require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler.middleware');
const logger = require('./src/utils/logger.util');
const response = require('./src/utils/response.util');
const { HTTP_STATUS } = require('./src/configs/constants');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers via Helmet
app.use(helmet());

// 2. Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: '*', // For production, replace with specific domain(s)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Request Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Rate Limiting for Authentication routes
const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,             // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiter specifically to auth endpoints
app.use('/api/v1/auth', authRateLimiter);

// 5. Mount API Routes
app.use('/api/v1', routes);

// 6. Handle 404 requests (Not Found)
app.use((req, res, next) => {
  return response.error(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND
  );
});

// 7. Mount Centralized Error Handling Middleware
app.use(errorHandler);

// 8. Start HTTP Server
const server = app.listen(PORT, () => {
  logger.info(`THIKANA Backend Service active in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optional: Graceful shutdown or PM2 process recovery
});

module.exports = app;
