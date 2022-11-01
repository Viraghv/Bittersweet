const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get("/getSessionState", authMiddleware, userController.getSessionState);

module.exports = router;
