const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get("/logout", userController.logout);

router.get('/getCurrentUser', authMiddleware, userController.getCurrentUser)
router.get('/uploadedRecipeCount/:id', userController.getUploadedRecipeCountById)
router.get('/pfp/:filename', userController.getPfp)
router.get('/currentUserAllRecipesWithComments', authMiddleware, userController.getCurrentUserAllRecipesWithComments)
router.get('/currentUserAllRecipeIds', authMiddleware, userController.getCurrentUserAllRecipeIds)

router.post('/groups/createForCurrentUser', authMiddleware, userController.createGroupForCurrentUser)
router.post('/groups/edit', authMiddleware, userController.editNameOfGroup)
router.get('/groups/delete/:id', authMiddleware, userController.deleteGroup)
router.get('/groups/allCurrentUser', authMiddleware, userController.getAllGroupsOfCurrentUser)
router.get('/groups/allOfRecipeAndUser/:id', authMiddleware, userController.getAllGroupsOfFavourite)
router.post('/groups/addRecipe', authMiddleware, userController.addRecipeToGroup)
router.post('/groups/deleteRecipe', authMiddleware, userController.deleteRecipeFromGroup)
router.get('/groups/getAllRecipeCards/:sortBy/:id/:page', authMiddleware, userController.getAllRecipeCardsOfGroup)
router.get('/groups/recipeCount/:id', authMiddleware, userController.getRecipeCountOfGroup)

router.get("/getSessionState", authMiddleware, userController.getSessionState);
router.get("/isLoggedIn", authMiddleware, userController.isLoggedIn);
router.get("/refreshToken", authMiddleware, userController.refreshToken)

module.exports = router;
