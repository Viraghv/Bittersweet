const favouriteService = require('../services/favouriteService');
const userService = require('../services/userService')
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
        let userGroups = await userService.getAllGroupsOfUserById(userId);

        await userService.deleteRecipeFromGroups(Number(req.params.id), userGroups);
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