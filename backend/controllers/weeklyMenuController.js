const weeklyMenuService = require('../services/weeklyMenuService')
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");

/**
 * Controller function for generating weekly menu by week for the current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.generateWeekForCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.generateWeekForUser(userId, Number(req.params.nextWeek)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for generating one new recipe for current user's weekly menu instead of the already existing one
 * by weeklyMenuItemId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.generateOneForCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.generateOneForUser(userId, req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for generating one new recipe for current user's weekly menu by week, day, and meal.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.generateOneByMealForCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.generateOneByMealForUser(userId, req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for putting a specific recipe on the weekly menu of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.setOneOfCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.setOneOfCurrentUser(userId, req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting weekly menu recipe cards of current user by week.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getRecipeCardsOfCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.getRecipeCardsOfUser(userId, Number(req.params.nextWeek)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for setting recipe as "Don't recommend" for current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.setDontRecommendForCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.setDontRecommendForUser(userId, Number(req.params.recipeId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting all "Don't recommend" recipe recipeIds of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllDontRecommendRecipesOfCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.getAllDontRecommendRecipesOfUser(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting all "Don't recommend" recipes of current user by page.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllDontRecommendRecipeCardsOfCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.getAllDontRecommendRecipeCardsOfCurrentUser(userId, Number(req.params.page)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting count of current user's all "Don't recommend" recipes.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllDontRecommendRecipeCardsCountOfCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.getAllDontRecommendRecipeCardsCountOfCurrentUser(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for removing recipe from current user's "Don't recommend" recipes.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteDontRecommendOfCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.deleteDontRecommendOfUser(userId, Number(req.params.recipeId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}