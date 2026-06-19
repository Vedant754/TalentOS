// src/middleware/ownership.middleware.js
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Checks if the logged-in user can access the :id employee record
// CEO/HR → always allowed
// Team Lead → only if the target employee reports to them
// Employee → only if the target employee IS them
const canAccessEmployee = asyncHandler(async (req, res, next) => {
  const { role, employee: myEmployeeId } = req.user;
  const targetId = req.params.id;

  // CEO and HR Manager bypass ownership checks entirely
  if (role === 'ceo' || role === 'hr_manager') {
    return next();
  }

  // Employee can only access their own record
  if (role === 'employee') {
    if (targetId !== String(myEmployeeId)) {
      throw new AppError('You can only access your own profile', 403);
    }
    return next();
  }

  // Team Lead can access their own record OR their direct reports'
  if (role === 'team_lead') {
    if (targetId === String(myEmployeeId)) return next();

    const target = await Employee.findById(targetId);
    if (!target) throw new AppError('Employee not found', 404);

    if (String(target.reportingTo) !== String(myEmployeeId)) {
      throw new AppError('You can only access your direct reports', 403);
    }
    return next();
  }

  throw new AppError('Access denied', 403);
});

module.exports = { canAccessEmployee };