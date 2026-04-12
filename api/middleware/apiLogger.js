/**
 * Middleware: Asynchronously log every API request to the ApiLog table.
 * Non-blocking — errors are caught silently so logging never breaks production.
 */
module.exports = function apiLogger(req, res, next) {
  const startTime = Date.now();

  // Hook into response finish event
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    // Lazy-load prisma to avoid circular deps and test failures
    try {
      const prisma = require('../config/database');
      if (!prisma || !prisma.apiLog) return; // Skip if model not available (test env)

      prisma.apiLog.create({
        data: {
          endpoint: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          ipAddress: (req.ip || req.connection?.remoteAddress || '').substring(0, 45),
          userAgent: (req.headers['user-agent'] || '').substring(0, 255),
          userId: req.user?.id || null,
          apiKeyId: req.apiKey?.id || null,
        }
      }).catch(() => {
        // Silent fail — logging should never crash production
      });
    } catch {
      // Module load failure in test — ignore
    }
  });

  next();
};
