const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const validate = require('../middleware/validate');
const { createEmployeeRules, updateEmployeeRules } = require('../validators/employee.validator');

router.get('/',    employeeController.getAllEmployees);
router.post('/',   validate(createEmployeeRules), employeeController.createEmployee);
router.get('/:id', employeeController.getEmployee);
router.put('/:id', validate(updateEmployeeRules), employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;