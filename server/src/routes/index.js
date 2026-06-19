// src/routes/index.js  — the route registry
const express = require('express');
const router = express.Router();

// Mount each domain's router at its prefix
// Adding a new feature = one line here + a new file
router.use('/auth',       require('./auth.routes'));
router.use('/employees',  require('./employee.routes'));
router.use('/leaves',     require('./leave.routes'));
// router.use('/attendance', require('./attendance.routes'));
// router.use('/departments',require('./department.routes'));
router.use('/uploads', require('./upload.routes'));

module.exports = router;