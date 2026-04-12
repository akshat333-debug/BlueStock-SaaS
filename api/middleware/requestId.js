const crypto = require('crypto');

/**
 * Middleware: Attach a unique requestId to every incoming request.
 * Populates res.locals.requestId for the response formatter.
 */
module.exports = function requestIdMiddleware(req, res, next) {
  const requestId = `req_${crypto.randomBytes(8).toString('hex')}`;
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};
