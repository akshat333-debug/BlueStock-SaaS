const { getRedisClient } = require('../config/redis');
const { sendError } = require('../utils/response');

// Plan daily limits
const PLAN_LIMITS = {
  FREE: 5000,
  PREMIUM: 50000,
  PRO: 300000,
  UNLIMITED: 1000000,
};

/**
 * Middleware: Subscription-tier based Rate Limiter.
 * Requires `req.user` to be populated by `authenticateApiKey`.
 */
exports.rateLimiter = async (req, res, next) => {
  try {
    const redis = getRedisClient();
    
    // Fallback: If Redis is completely unavailable, pass through
    if (!redis) {
      console.warn('[RateLimiter] Redis not available. Bypassing rate limits.');
      return next();
    }

    const { user, apiKey } = req;
    if (!user || !user.planType) {
      return sendError(res, 500, 'INTERNAL_ERROR', 'User profile not found in request context.');
    }

    const limit = PLAN_LIMITS[user.planType] || PLAN_LIMITS.FREE;

    // We track based on the API Key ID for today
    const dateStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const redisKey = `rateLimit:${apiKey.id}:${dateStr}`;

    // Increment usage for this key
    const currentUsage = await redis.incr(redisKey);
    
    // Set expiry if it's the first request of the day (expire after 24 hrs + 1 hr buffer)
    if (currentUsage === 1) {
      await redis.expire(redisKey, 25 * 3600);
    }

    const remaining = Math.max(0, limit - currentUsage);
    
    // Inject headers for response payload `meta.rateLimit`
    res.locals.rateLimit = {
      limit: limit,
      remaining: remaining,
      reset: new Date(new Date().setUTCHours(23, 59, 59, 999)).toISOString(),
    };
    
    // Set actual HTTP headers as well
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (currentUsage > limit) {
      return sendError(res, 429, 'RATE_LIMITED', 'Daily quota exceeded. Please upgrade your plan for more requests.');
    }

    next();
  } catch (err) {
    console.error('[RateLimiter Error]', err);
    // Fail open if Redis crashes so we don't break production
    next();
  }
};
