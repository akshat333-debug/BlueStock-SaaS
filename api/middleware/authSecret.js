const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { sendError } = require('../utils/response');

/**
 * Middleware: authenticateApiSecret
 * 
 * Verifies BOTH the X-API-Key and the X-API-Secret for write operations (POST, PUT, DELETE).
 * Requires the standard `authenticateApiKey` to be run before it to inject `req.apiKey` and `req.user`.
 * Designed explicitly for Section 6.2 rules: "Header: X-API-Secret: {api_secret} (for write operations)"
 */
exports.authenticateApiSecret = async (req, res, next) => {
  try {
    const apiSecret = req.header('X-API-Secret');

    if (!apiSecret) {
      return sendError(res, 401, 'MISSING_SECRET', 'X-API-Secret header is required for write operations.');
    }

    if (!req.apiKey || !req.user) {
         return sendError(res, 500, 'INTERNAL_ERROR', 'Context error. Key authentication must precede Secret validation.');
    }

    // Verify format (as_[32hex])
    if (!apiSecret.startsWith('as_') || apiSecret.length < 35) {
      return sendError(res, 401, 'INVALID_SECRET_FORMAT', 'Invalid API secret format.');
    }

    // Attempt to pull the secret hash exactly for this matched API Key
    const keyRecord = await prisma.apiKey.findUnique({
      where: { id: req.apiKey.id },
      select: { secretHash: true }
    });

    if (!keyRecord || !keyRecord.secretHash) {
      return sendError(res, 401, 'INVALID_SECRET', 'No secret established for this key.');
    }

    // Cryptographically compare the incoming plaintext secret with DB hash
    const isMatch = await bcrypt.compare(apiSecret, keyRecord.secretHash);

    if (!isMatch) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Invalid API Secret.');
    }

    next();
  } catch (error) {
    console.error('[AuthSecret Error]', error);
    return sendError(res, 500, 'INTERNAL_ERROR', 'Authentication validation failed.');
  }
};
