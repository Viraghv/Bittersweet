const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const authMiddleware = require('../middlewares/auth');


router.get('/add/:id', authMiddleware, favouriteController.addById);
router.get('/delete/:id', authMiddleware, favouriteController.deleteById);
router.get('/allUserFavourites', authMiddleware, favouriteController.getallUserFavourites);
router.get('/allUserFavouriteCards/:sortBy/:page', authMiddleware, favouriteController.getAllUserFavouriteCards);
router.get('/allUserFavouriteCount', authMiddleware, favouriteController.getAllUserFavouriteCount);

router.post('/groups/createForCurrentUser', authMiddleware, favouriteController.createGroupForCurrentUser);
router.post('/groups/edit', authMiddleware, favouriteController.editNameOfGroup);
router.get('/groups/delete/:id', authMiddleware, favouriteController.deleteGroup);
router.get('/groups/allCurrentUser', authMiddleware, favouriteController.getAllGroupsOfCurrentUser);
router.get('/groups/allOfRecipeAndUser/:id', authMiddleware, favouriteController.getAllGroupsOfFavourite);
router.post('/groups/addRecipe', authMiddleware, favouriteController.addRecipeToGroup);
router.post('/groups/deleteRecipe', authMiddleware, favouriteController.deleteRecipeFromGroup);
router.get('/groups/getAllRecipeCards/:sortBy/:id/:page', authMiddleware, favouriteController.getAllRecipeCardsOfGroup);
router.get('/groups/recipeCount/:id', authMiddleware, favouriteController.getRecipeCountOfGroup);

module.exports = router;