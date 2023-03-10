const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');
const authMiddleware = require('../middlewares/auth');

// add recipe by recipeId to current user's favourites
router.get('/add/:id', authMiddleware, favouriteController.addById);
// delete recipe by recipeId from current user's favourites
router.get('/delete/:id', authMiddleware, favouriteController.deleteById);
// get all favourite recipeIds of current user
router.get('/allUserFavourites', authMiddleware, favouriteController.getAllUserFavourites);
// get all favourite recipe cards of current user, sorted, paginated
router.get('/allUserFavouriteCards/:sortBy/:page', authMiddleware, favouriteController.getAllUserFavouriteCards);
// get count of current user's all favourites
router.get('/allUserFavouriteCount', authMiddleware, favouriteController.getAllUserFavouriteCount);

// create new group for current user
router.post('/groups/create', authMiddleware, favouriteController.createGroupForCurrentUser);
// edit group of current user by groupId
router.post('/groups/edit/:id', authMiddleware, favouriteController.editNameOfGroup);
// delete group of current user by groupId
router.get('/groups/delete/:id', authMiddleware, favouriteController.deleteGroup);
// get all groups of current user
router.get('/groups/allCurrentUser', authMiddleware, favouriteController.getAllGroupsOfCurrentUser);
// get all of current user's groups that recipe is in by recipeId
router.get('/groups/allGroupsOfFavourite/:id', authMiddleware, favouriteController.getAllGroupsOfFavourite);
// add recipe to group by groupId and recipeId
router.post('/groups/addRecipe', authMiddleware, favouriteController.addRecipeToGroup);
// delete recipe from group by groupId and recipeId
router.post('/groups/deleteRecipe', authMiddleware, favouriteController.deleteRecipeFromGroup);
// get all recipe cards of group by groupId, sorted, paginated
router.get('/groups/getAllRecipeCards/:sortBy/:id/:page', authMiddleware, favouriteController.getAllRecipeCardsOfGroup);
// get count of recipes in group by groupId
router.get('/groups/recipeCount/:id', authMiddleware, favouriteController.getRecipeCountOfGroup);

module.exports = router;