const express = require('express');
const prisma = require('../config/database');
const { getCache, setCache } = require('../config/redis');

const router = express.Router();

/**
 * GET /api/health
 * Server health check — returns DB connection status and basic stats
 */
router.get('/health', async (req, res) => {
  const startTime = Date.now();

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (err) {
    const responseTime = Date.now() - startTime;

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/stats
 * Returns record counts for all hierarchy levels
 * Cached for 5 minutes
 */
router.get('/v1/stats', async (req, res) => {
  const startTime = Date.now();
  const cacheKey = 'stats:counts';

  try {
    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        meta: {
          responseTime: Date.now() - startTime,
          cached: true,
        },
      });
    }

    // Query all counts in parallel
    const [countries, states, districts, subDistricts, villages, users, apiKeys] =
      await Promise.all([
        prisma.country.count(),
        prisma.state.count(),
        prisma.district.count(),
        prisma.subDistrict.count(),
        prisma.village.count(),
        prisma.user.count(),
        prisma.apiKey.count(),
      ]);

    const data = {
      hierarchy: {
        countries,
        states,
        districts,
        subDistricts,
        villages,
      },
      platform: {
        users,
        apiKeys,
      },
      totalGeographicalRecords: countries + states + districts + subDistricts + villages,
    };

    // Cache for 5 minutes
    await setCache(cacheKey, data, 300);

    res.json({
      success: true,
      data,
      meta: {
        responseTime: Date.now() - startTime,
        cached: false,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: err.message,
    });
  }
});

module.exports = router;
