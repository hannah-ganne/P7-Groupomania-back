const express = require('express');
const router = express.Router();
const limiter = require('../middleware/rateLimiter');
const passwordValidator = require('../middleware/password-validator');

const userCtrl = require('../controllers/User.js');

router.post('/signup', passwordValidator, userCtrl.signup);
router.post('/login', limiter.loginLimiter, userCtrl.login);

module.exports = router; 