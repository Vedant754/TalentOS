// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', validate(registerRules), ctrl.register);
router.post('/login', authLimiter, validate(loginRules), ctrl.login); // rate-limited!
router.post('/refresh', ctrl.refresh);
router.post('/logout', protect, ctrl.logout);
router.get('/me', protect, ctrl.getMe);

module.exports = router;