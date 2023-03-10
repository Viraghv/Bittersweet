const favouriteService = require('../services/favouriteService');
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");

/**
 * Controller function for adding recipe by recipeId to current user's favourites.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting recipe by recipeId from current user's favourites.
 * Deletes recipe from all the user's groups, and then from their favourites.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all favourite recipeIds of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllUserFavourites = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.getAllUserFavourites(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting all favourite recipe cards of current user, sorted, by page.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting the count of current user's all favourites.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for creating a new group for the current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.createGroupForCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.createGroupForUser(req.body.name, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for editing group of current user by groupId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.editNameOfGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await favouriteService.editNameOfGroup(Number(req.params.id), req.body.newName, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for deleting group of current user by groupId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all groups of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all of current user's groups that recipe is in by recipeId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for adding recipe to group by groupId and recipeId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting recipe from group by groupId and recipeId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all recipe cards of group by groupId, sorted, by page.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting count of recipes in group by groupId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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