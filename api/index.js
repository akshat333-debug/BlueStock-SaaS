require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/health');
const geographyRoutes = require('./routes/v1/geography');
const searchRoutes = require('./routes/v1/search');
const keyRoutes = require('./routes/keys');
const authRoutes = require('./routes/auth');
const requestIdMiddleware = require('./middleware/requestId');
const apiLogger = require('./middleware/apiLogger');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS — allow all origins in dev, restrict in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://villageapi.com', 'https://admin.villageapi.com']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-API-Secret'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request ID generation
app.use(requestIdMiddleware);

// API request logging (writes to ApiLog table)
app.use(apiLogger);

// Global rate limiter (fallback — per-key limits applied in API routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 1000,                   // 1000 requests per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many requests, please try again later.',
  },
});
app.use(globalLimiter);

// Per-minute burst limiter (Section 10.4)
const burstLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,              // Free tier: 100 req/min (scales by plan via per-key middleware)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Burst limit exceeded. Please slow down.' },
});
app.use('/api/v1', burstLimiter);

// Request logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health & stats
app.use('/api', healthRoutes);

// Auth Endpoints
app.use('/api/auth', authRoutes);

// V1 API Endpoints
app.use('/api/v1/keys', keyRoutes);
app.use('/api/v1', geographyRoutes);
app.use('/api/v1', searchRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bluestock SaaS — Village API',
    version: '1.0.0',
    description: 'REST API for India\'s complete village-level geographical data',
    docs: '/api/v1/docs',
    health: '/api/health',
    stats: '/api/v1/stats',
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  });
});

// ============================================
// START SERVER
// ============================================

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   Bluestock SaaS — Village API Server     ║
║   Running on http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
╚═══════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
