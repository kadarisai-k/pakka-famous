/**
 * Wraps async route handlers so any uncaught promise rejection
 * is automatically forwarded to Express's error handler.
 * This eliminates the need for try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
