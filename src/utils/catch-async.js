/**
 * Wraps an async route handler and forwards rejections to the error middleware.
 */
const catchAsync = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = catchAsync;
