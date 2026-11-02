const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // increased for interactive simulation updates
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/health',
  message: { success: false, error: 'Too many requests, please try again later.' },
});

module.exports = { apiLimiter };
