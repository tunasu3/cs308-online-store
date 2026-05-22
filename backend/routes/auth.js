const express = require('express');
const router = express.Router();
const { register, login, verifySession } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verifySession', verifySession);

module.exports = router;