const shoppingListService = require('../services/shoppingListService')
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");

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

module.exports.addCategoryAndItems = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        let category = await shoppingListService.addCategory(req.body.categoryName, userId);
        res.json(await shoppingListService.addItems(category.id, req.body.items))

    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addItemsToCategoryById = async (req, res) => {
    try {
        res.json(await shoppingListService.addItems(Number(req.params.id), req.body.items))
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

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