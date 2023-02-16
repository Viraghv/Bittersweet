const favouriteService = require('../services/favouriteService');
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");

module.exports.addById = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.addById(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteById = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        let userGroups = await favouriteService.getAllGroupsOfUserById(userId);

        await favouriteService.deleteRecipeFromGroups(Number(req.params.id), userGroups);
        res.json( await favouriteService.deleteById(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getallUserFavourites = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.getallUserFavourites(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllUserFavouriteCards = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.getAllUserFavouriteCards(Number(req.params.page), req.params.sortBy, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllUserFavouriteCount = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.getAllUserFavouriteCount(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.createGroupForCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.createGroupForCurrentUser(req.body.name, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editNameOfGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.editNameOfGroup(Number(req.body.groupId), req.body.newName, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.deleteGroup(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllGroupsOfCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.getAllGroupsOfUserById(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllGroupsOfFavourite = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json(await favouriteService.getAllGroupsOfFavouriteById(Number(req.params.id), Number(userId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addRecipeToGroup = async (req, res) => {
    try {
        res.json( await favouriteService.addRecipeToGroup(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteRecipeFromGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.deleteRecipeFromGroup(Number(req.body.groupId), Number(req.body.recipeId), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllRecipeCardsOfGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json(await favouriteService.getAllRecipeCardsOfGroup(req.params.sortBy, Number(req.params.id), Number(req.params.page), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getRecipeCountOfGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json(await favouriteService.getRecipeCountOfGroup(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}