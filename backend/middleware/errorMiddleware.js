const errorHandler = (err, req, res, next) => {
  // Log error stack trace internally for developers
  console.error(err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Server error';
  const details = err.details || null;

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
};

module.exports = { errorHandler };
