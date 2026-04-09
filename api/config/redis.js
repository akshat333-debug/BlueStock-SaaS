const Redis = require('ioredis');

let redis = null;

/**
 * Get Redis client instance (lazy initialization)
 * Falls back gracefully if Redis is not configured
 */
function getRedisClient() {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('[Redis] REDIS_URL not configured — caching disabled');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 200, 2000);
      },
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    redis.on('connect', () => console.log('[Redis] Connected'));
    redis.on('error', (err) => console.error('[Redis] Error:', err.message));

    return redis;
  } catch (err) {
    console.error('[Redis] Failed to initialize:', err.message);
    return null;
  }
}

/**
 * Get cached value by key
 * @param {string} key 
 * @returns {any|null} parsed JSON or null
 */
async function getCache(key) {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('[Redis] getCache error:', err.message);
    return null;
  }
}

/**
 * Set cache value with TTL
 * @param {string} key 
 * @param {any} value — will be JSON.stringified
 * @param {number} ttlSeconds — default 3600 (1 hour)
 */
async function setCache(key, value, ttlSeconds = 3600) {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[Redis] setCache error:', err.message);
  }
}

/**
 * Delete cached key
 * @param {string} key 
 */
async function deleteCache(key) {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
  } catch (err) {
    console.error('[Redis] deleteCache error:', err.message);
  }
}

module.exports = { getRedisClient, getCache, setCache, deleteCache };
