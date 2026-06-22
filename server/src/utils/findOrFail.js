// src/utils/findOrFail.js
const AppError = require('./AppError');

// Wraps any Mongoose query, throws a consistent 404 if the result is null
const findOrFail = async (queryPromise, resourceName = 'Resource') => {
  const result = await queryPromise;
  if (!result) throw new AppError(`${resourceName} not found`, 404, 'NOT_FOUND');
  return result;
};

module.exports = findOrFail;