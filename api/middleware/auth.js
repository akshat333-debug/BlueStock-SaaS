const prisma = require('../config/database');
const { sendError } = require('../utils/response');
const { getCache, setCache } = require('../config/redis');

/**
 * Middleware: Verify API Key from headers.
 * Looks for `X-API-Key`. Validates the key, ensures it's active,
 * not expired, and attaches the user object to `req`.
 */
exports.authenticateApiKey = async (req, res, next) => {
  try {
    const apiKeyHeader = req.headers['x-api-key'];

    if (!apiKeyHeader) {
      return sendError(res, 401, 'INVALID_API_KEY', 'Missing X-API-Key header.');
    }

    // 1. Try to fetch from Redis Cache first
    const cacheKey = `apiKey:${apiKeyHeader}`;
    let keyData = await getCache(cacheKey);

    // 2. Fallback to DB if not cached
    if (!keyData) {
      const apiKeyRow = await prisma.apiKey.findUnique({
        where: { key: apiKeyHeader },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              planType: true,
            }
          }
        }
      });

      if (!apiKeyRow) {
         return sendError(res, 401, 'INVALID_API_KEY', 'Invalid API key.');
      }

      keyData = apiKeyRow;

      // Cache the valid API key for 5 minutes (300s)
      await setCache(cacheKey, keyData, 300);
    }

    // 3. Validation checks
    if (!keyData.isActive) {
      return sendError(res, 403, 'ACCESS_DENIED', 'API key has been revoked or deactivated.');
    }

    if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
      return sendError(res, 403, 'ACCESS_DENIED', 'API key has expired.');
    }

    if (keyData.user.status !== 'ACTIVE') {
      return sendError(res, 403, 'ACCESS_DENIED', 'User account is not active.');
    }

    // Attach to request
    req.apiKey = { id: keyData.id, name: keyData.name };
    req.user = keyData.user;

    next();
  } catch (err) {
    console.error('[Auth Middleware Error]', err);
    return sendError(res, 500, 'INTERNAL_ERROR', 'An error occurred during authentication.');
  }
};

/**
 * Middleware: Verify if user has access to a specific state.
 * Depends on param paramName (e.g., 'state_id' or 'id')
 */
exports.verifyStateAccess = (stateIdParamName = 'id') => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      const stateId = parseInt(req.params[stateIdParamName], 10);

      if (isNaN(stateId)) {
        return sendError(res, 400, 'INVALID_QUERY', 'Invalid State ID.');
      }

      // Pro and Unlimited plans have all-India access automatically
      if (user.planType === 'PRO' || user.planType === 'UNLIMITED') {
        return next();
      }

      // 1. Try to fetch from Redis Cache
      const cacheKey = `userAccess:${user.id}:${stateId}`;
      let hasAccess = await getCache(cacheKey);

      // 2. Fallback to DB
      if (hasAccess === null) {
        const accessCheck = await prisma.userStateAccess.findUnique({
          where: {
             userId_stateId: {
                 userId: user.id,
                 stateId: stateId
             }
          }
        });

        hasAccess = !!accessCheck;

        // Cache the result for 15 mins (900s)
        await setCache(cacheKey, hasAccess, 900);
      }

      if (!hasAccess) {
        return sendError(res, 403, 'ACCESS_DENIED', 'Your subscription plan does not have access to this state.');
      }

      next();
    } catch (err) {
       console.error('[Access Middleware Error]', err);
       return sendError(res, 500, 'INTERNAL_ERROR', 'An error occurred during access control check.');
    }
  };
};
