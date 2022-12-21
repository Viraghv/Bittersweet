const shoppingListService = require('../services/shoppingListService')
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");

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
