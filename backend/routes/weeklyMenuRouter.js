const express = require('express');
const router = express.Router();
const weeklyMenuController = require('../controller/weeklyMenuController');
const authMiddleware = require('../middlewares/auth');
const weeklyMenuService = require("../services/weeklyMenuService");

router.get('/generate/week/:nextWeek', authMiddleware, weeklyMenuController.generateWeekForCurrentUser);
router.post('/generate/one', authMiddleware, weeklyMenuController.generateOneForCurrentUser);

router.get('/dontRecommend/set/:recipeId', authMiddleware, weeklyMenuController.setDontRecommendForCurrentUser);
router.get('/dontRecommend/allOfCurrentUser', authMiddleware, weeklyMenuController.getAllDontRecommendRecipesOfCurrentUser);

router.get('/recipeCardsOfCurrentUser/:nextWeek', authMiddleware, weeklyMenuController.getRecipeCardsOfCurrentUser);

module.exports = router;