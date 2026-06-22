// const express = require('express');
// const router = express.Router();
// const employeeController = require('../controllers/employee.controller');
// const validate = require('../middleware/validate');
// const { createEmployeeRules, updateEmployeeRules } = require('../validators/employee.validator');

// router.get('/',    employeeController.getAllEmployees);
// router.post('/',   validate(createEmployeeRules), employeeController.createEmployee);
// router.get('/:id', employeeController.getEmployee);
// router.put('/:id', validate(updateEmployeeRules), employeeController.updateEmployee);
// router.delete('/:id', employeeController.deleteEmployee);

// module.exports = router;

// src/routes/employee.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/employee.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth.middleware'); 
const { canAccessEmployee } = require('../middleware/ownership.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { createEmployeeRules, updateEmployeeRules } = require('../validators/employee.validator');

// All employee routes are protected — only authenticated users can access them
router.use(protect);

// Stats first — before /:id so "stats" isn't treated as an ID
router.get('/stats', authorize('ceo', 'hr_manager'), ctrl.getEmployeeStats);

router.route('/')
  // GET / — everyone can call this, but getAllEmployees scopes results by role internally
  .get(ctrl.getAllEmployees)
  // POST / — only HR Manager and CEO can create new employees
  .post(authorize('hr_manager', 'ceo'), validate(createEmployeeRules), ctrl.createEmployee);

// src/routes/employee.routes.js — add above router.route('/:id')
router.put('/me', ctrl.updateMyProfile); // No authorize() needed — any role can update their own

router.route('/:id')
  // GET /:id — any authenticated role, but ownership check restricts WHICH :id
  .get(canAccessEmployee, ctrl.getEmployee)
  // PUT /:id — ownership check + only HR/CEO can edit (employees can't edit own salary etc.)
  .put(authorize('hr_manager', 'ceo'), validate(updateEmployeeRules), ctrl.updateEmployee)
  // DELETE /:id — only HR Manager and CEO
  .delete(authorize('hr_manager', 'ceo'), ctrl.deleteEmployee);

router.post('/:id/documents', ctrl.addDocument);

module.exports = router;