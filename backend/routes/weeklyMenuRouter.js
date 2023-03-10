const express = require('express');
const router = express.Router();
const weeklyMenuController = require('../controllers/weeklyMenuController');
const authMiddleware = require('../middlewares/auth');

// generate weekly menu by week for current user
router.get('/generate/week/:nextWeek', authMiddleware, weeklyMenuController.generateWeekForCurrentUser);
// generate one new recipe for current user's weekly menu instead of already existing one by weeklyMenuItemId
router.post('/generate/one', authMiddleware, weeklyMenuController.generateOneForCurrentUser);
// generate one new recipe for current user's weekly menu by week, day, and meal
router.post('/generate/oneByMeal', authMiddleware, weeklyMenuController.generateOneByMealForCurrentUser)

// put specific recipe on weekly menu of current user
router.post('/set/one', authMiddleware, weeklyMenuController.setOneOfCurrentUser);
// get weekly menu recipe cards of current user by week
router.get('/recipeCardsOfCurrentUser/:nextWeek', authMiddleware, weeklyMenuController.getRecipeCardsOfCurrentUser);

// set recipe as "Don't recommend" for current user
router.get('/dontRecommend/set/:recipeId', authMiddleware, weeklyMenuController.setDontRecommendForCurrentUser);
// get all "Don't recommend" recipe recipeIds of current user
router.get('/dontRecommend/allOfCurrentUser', authMiddleware, weeklyMenuController.getAllDontRecommendRecipesOfCurrentUser);
//  get all "Don't recommend" recipes of current user by page
router.get('/dontRecommend/allRecipeCards/:page', authMiddleware, weeklyMenuController.getAllDontRecommendRecipeCardsOfCurrentUser);
// get count of current user's all "Don't recommend" recipes
router.get('/dontRecommend/count/allRecipeCards', authMiddleware, weeklyMenuController.getAllDontRecommendRecipeCardsCountOfCurrentUser);
// remove recipe from current user's "Don't recommend" recipes
router.get('/dontRecommend/delete/:recipeId', authMiddleware, weeklyMenuController.deleteDontRecommendOfCurrentUser);

module.exports = router;