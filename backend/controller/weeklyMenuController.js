const weeklyMenuService = require('../services/weeklyMenuService')
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");

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

module.exports.deleteDontRecommendOfCurrentUser = async (req, res) => {
    try {
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        res.json( await weeklyMenuService.deleteDontRecommendOfCurrentUser(userId, Number(req.params.recipeId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

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