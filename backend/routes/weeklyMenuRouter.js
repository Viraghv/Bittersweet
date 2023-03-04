const express = require('express');
const router = express.Router();
const weeklyMenuController = require('../controllers/weeklyMenuController');
const authMiddleware = require('../middlewares/auth');

router.get('/generate/week/:nextWeek', authMiddleware, weeklyMenuController.generateWeekForCurrentUser);
router.post('/generate/one', authMiddleware, weeklyMenuController.generateOneForCurrentUser);
router.post('/generate/oneByMeal', authMiddleware, weeklyMenuController.generateOneByMealForCurrentUser)

router.post('/set/one', authMiddleware, weeklyMenuController.setOneOfCurrentUser);

router.get('/dontRecommend/set/:recipeId', authMiddleware, weeklyMenuController.setDontRecommendForCurrentUser);
router.get('/dontRecommend/allOfCurrentUser', authMiddleware, weeklyMenuController.getAllDontRecommendRecipesOfCurrentUser);
router.get('/dontRecommend/allRecipeCards/:page', authMiddleware, weeklyMenuController.getAllDontRecommendRecipeCardsOfCurrentUser);
router.get('/dontRecommend/count/allRecipeCards', authMiddleware, weeklyMenuController.getAllDontRecommendRecipeCardsCountOfCurrentUser);
router.get('/dontRecommend/delete/:recipeId', authMiddleware, weeklyMenuController.deleteDontRecommendOfCurrentUser);

router.get('/recipeCardsOfCurrentUser/:nextWeek', authMiddleware, weeklyMenuController.getRecipeCardsOfCurrentUser);

module.exports = router;