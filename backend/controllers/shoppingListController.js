const shoppingListService = require('../services/shoppingListService')
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");

/**
 * Controller function for getting the current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getCurrentUserList = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await shoppingListService.getUserListById(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for adding a new category to current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.addCategory = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await shoppingListService.addCategory(req.body.name, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for adding a new category with items in it to current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.addCategoryAndItems = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        let category = await shoppingListService.addCategory(req.body.categoryName, userId);
        res.json(await shoppingListService.addItemsToCategoryById(category.id, req.body.items))

    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for adding new items to a category by categoryId on user's shopping list.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.addItemsToCategoryById = async (req, res) => {
    try {
        res.json(await shoppingListService.addItemsToCategoryById(Number(req.params.id), req.body.items))
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for editing the name of a category by categoryId on current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.editCategoryById = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await shoppingListService.editCategoryById(Number(req.params.id), req.body.name, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for setting the 'done' attribute of an item on current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.setItemDoneById = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await shoppingListService.setItemDoneById(Number(req.params.id), req.body.done, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for deleting a category by categoryId on current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteCategoryById = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await shoppingListService.deleteCategoryById(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for deleting all categories (and with that, all items too) from current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteAllCategoriesOfCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await shoppingListService.deleteAllCategoriesOfUser(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for deleting all items set as 'done' from current user's shopping list.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteAllDoneItemsOfUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await shoppingListService.deleteAllDoneItemsOfUser(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}