// src/middleware/validate.js
const { validationResult } = require('express-validator');

// This is a middleware FACTORY — it returns a middleware function.
// This pattern lets you pass configuration to middleware.
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation rules in parallel
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next(); // All good — proceed to controller
    }

    // Format errors cleanly for the frontend
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  };
};

module.exports = validate;