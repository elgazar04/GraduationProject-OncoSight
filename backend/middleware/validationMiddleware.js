const AppError = require('../utils/appError');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const details = error.errors 
      ? error.errors.map(e => ({ field: e.path.join('.'), message: e.message })) 
      : error.message;
    next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
  }
};

module.exports = { validate };
