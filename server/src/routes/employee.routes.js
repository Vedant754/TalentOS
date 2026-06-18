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
const { createEmployeeRules, updateEmployeeRules } = require('../validators/employee.validator');

// All employee routes are protected — only authenticated users can access them
router.use(protect);

// Stats first — before /:id so "stats" isn't treated as an ID
router.get('/stats',  ctrl.getEmployeeStats);

router.route('/')
  .get(ctrl.getAllEmployees)
  .post(validate(createEmployeeRules), ctrl.createEmployee);

router.route('/:id')
  .get(ctrl.getEmployee)
  .put(validate(updateEmployeeRules), ctrl.updateEmployee)
  .delete(ctrl.deleteEmployee);

router.post('/:id/documents', ctrl.addDocument);

module.exports = router;