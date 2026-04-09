/**
 * Standard API Response Formatter
 */

exports.sendSuccess = (res, data, count = null, startTime = Date.now()) => {
  const payload = {
    success: true,
    data: data,
  };

  if (count !== null) {
    payload.count = count;
  }

  payload.meta = {
    requestId: res.locals.requestId || 'req_unknown',
    responseTime: Date.now() - startTime,
  };

  // Add rate limit headers if set by middleware
  if (res.locals.rateLimit) {
    payload.meta.rateLimit = res.locals.rateLimit;
  }

  return res.status(200).json(payload);
};

exports.sendError = (res, statusCode, errorCode, message, details = null) => {
  const payload = {
    success: false,
    error: errorCode,
    message: message,
  };

  if (details && process.env.NODE_ENV !== 'production') {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};
