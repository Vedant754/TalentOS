// Controllers only handle request/response.
// They call services or models for actual logic.

const asyncHandler = require('../utils/asyncHandler');

const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find();
  res.json({ success: true, data: employees });
  // If Employee.find() throws, asyncHandler catches it and calls next(error)
  // which hits the global error handler in app.js
});

const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, role, department } = req.body;

  // Basic validation (Phase 7 will make this production-grade)
  if (!name || !email) {
    throw new Error('Name and email are required');
  }

  res.status(201).json({     // 201 = Created (not 200)
    success: true,
    message: 'Employee created',
    data: { name, email, role, department }
  });
});

const getEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ success: true, data: { id, name: 'Sample Employee' } });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ success: true, message: `Employee ${id} updated`, data: req.body });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ success: true, message: `Employee ${id} deleted` });
});

module.exports = { getAllEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee };
     