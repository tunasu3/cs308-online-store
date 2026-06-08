const express = require('express');
const router = express.Router();
const { register, login, verifySession, updateProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verifySession', verifySession);
router.post('/updateProfile', updateProfile);

module.exports = router;