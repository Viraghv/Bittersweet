const recipeService = require('../services/recipeService')
const HttpException = require("../exceptions/HttpException");
const NotFound = require("../exceptions/NotFound");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");
const fs = require("fs");
const userService = require("../services/userService");
const BadRequest = require("../exceptions/BadRequest");
const path = require("path");


module.exports.createOne = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.createOne(req.body, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.uploadImage = async (req, res) => {
    try {
        if(req.fileValidationErrors.length > 0){
            throw new BadRequest(req.fileValidationErrors);
        }

        res.json(await recipeService.uploadImage(req.file, req.params.id));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }

}

module.exports.editRecipeOfCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.editRecipeOfUser(Number(req.params.id), req.body, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteRecipeOfCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.deleteRecipeOfUser(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllRecipeCount = async (req, res) => {
    try {
        res.json( await recipeService.getAllRecipeCount());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getRecipeById = async (req, res) => {
    try {
        res.json( await recipeService.getRecipeById(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getRecipeImage = async (req, res) => {
    try {
        let dir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
        let img = dir + `/uploads/recipe_images/${req.params.filename}`;

        fs.readFile(img, function (err, content) {
            if (err) {
                sendHttpException(res, new NotFound(["Recipe image not found."]));
            } else {
                res.writeHead(200, {"Content-type": "image/jpg"});
                res.end(content.toString('base64'));
            }
        })

    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllRecpieCardsWithPagination = async (req, res) => {
    try {
        res.json( await recipeService.getAllRecpieCardsWithPagination(Number(req.params.page)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getFilteredRecipeCards = async (req, res) => {
    try {
        res.json( await recipeService.getFilteredRecipeCards(req.params.sortBy, Number(req.params.page), req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getCommentsByRecipeId = async (req, res) => {
    try {
        res.json( await recipeService.getCommentsByRecipeId(Number(req.params.id), Number(req.params.page)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getCommentCountById = async (req, res) => {
    try {
        res.json( await recipeService.getCommentCountById(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAverageRatingById = async (req, res) => {
    try {
        res.json( await recipeService.getAverageRatingById(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addComment = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        let commentedRecipeIds = await userService.getUsersAllRecipesWithCommentsById(userId);

        if (!commentedRecipeIds.includes(Number(req.body.recipeId))){
            let usersRecipes = await userService.getUsersAllRecipeIds(userId);

            if (!usersRecipes.includes(Number(req.body.recipeId))){
                res.json( await recipeService.addComment(req.body, userId));
            } else {
                throw new BadRequest(["A user can't comment on their own recipe."]);
            }
        } else {
            throw new BadRequest(["The user already has commented on this recipe."]);
        }

    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editComment = async (req, res) => {
    try {
        res.json( await recipeService.editComment(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getCommentOfCurrentUserByRecipeId = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.getCommentByUserAndRecipeId(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllUnits = async (req, res) => res.json(await recipeService.getAllUnits());

module.exports.getAllDifficulties = async (req, res) => res.json(await recipeService.getAllDifficulties());

module.exports.getAllCategories = async (req, res) => res.json(await recipeService.getAllCategories());

module.exports.getAllAllergens = async (req, res) => res.json(await  recipeService.getAllAllergens());

module.exports.getAllCosts = async (req, res) => res.json(await recipeService.getAllCosts());