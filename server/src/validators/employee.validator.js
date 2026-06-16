const { body } = require('express-validator');

const createEmployeeRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['ceo', 'hr_manager', 'team_lead', 'employee'])
    .withMessage('Role must be one of: ceo, hr_manager, team_lead, employee'),

  body('department')
    .notEmpty().withMessage('Department is required'),

  body('salary')
    .optional()
    .isNumeric().withMessage('Salary must be a number')
    .isFloat({ min: 0 }).withMessage('Salary cannot be negative'),
];

const updateEmployeeRules = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('salary').optional().isNumeric().isFloat({ min: 0 }),
];

module.exports = { createEmployeeRules, updateEmployeeRules };