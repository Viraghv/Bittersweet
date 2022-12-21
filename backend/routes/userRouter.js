const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get("/logout", userController.logout);

router.get('/uploadedRecipeCount/:id', userController.getUploadedRecipeCountById)
router.get('/pfp/:filename', userController.getPfp)

router.post('/groups/createForCurrentUser', authMiddleware, userController.createGroupForCurrentUser)
router.get('/groups/allCurrentUser', authMiddleware, userController.getAllGroupsOfCurrentUser)
router.post('/groups/addRecipe', authMiddleware, userController.addRecipeToGroup)

router.get("/getSessionState", authMiddleware, userController.getSessionState);
router.get("/isLoggedIn", authMiddleware, userController.isLoggedIn);
router.get("/refreshToken", authMiddleware, userController.refreshToken)

module.exports = router;
