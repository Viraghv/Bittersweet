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
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.editComment(req.body, Number(userId)));
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

module.exports.getAllActiveUnits = async (req, res) => {
    try {
        res.json(await recipeService.getAllActiveUnits());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllUnits = async (req, res) => {
    try {
        res.json(await recipeService.getAllUnits());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllDifficulties = async (req, res) => {
    try {
        res.json(await recipeService.getAllDifficulties());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllActiveCategories = async (req, res) => {
    try {
        res.json(await recipeService.getAllActiveCategories());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllCategories = async (req, res) => {
    try {
        res.json(await recipeService.getAllCategories());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllActiveDiets = async (req, res) => {
    try {
        res.json(await recipeService.getAllActiveDiets());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllDiets = async (req, res) => {
    try {
        res.json(await recipeService.getAllDiets());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllActiveAllergens = async (req, res) => {
    try {
        res.json(await  recipeService.getAllActiveAllergens());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllAllergens = async (req, res) => {
    try {
        res.json(await  recipeService.getAllAllergens());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addUnit = async (req, res) => {
    try {
        res.json(await  recipeService.addUnit(req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editUnit = async (req, res) => {
    try {
        res.json(await  recipeService.editUnit(Number(req.params.id), req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.setDeactivatedUnit = async (req, res) => {
    try {
        res.json(await  recipeService.setDeactivatedUnit(Number(req.params.id), req.body.deactivated));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addCategory = async (req, res) => {
    try {
        res.json(await  recipeService.addCategory(req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editCategory = async (req, res) => {
    try {
        res.json(await  recipeService.editCategory(Number(req.params.id), req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.setDeactivatedCategory = async (req, res) => {
    try {
        res.json(await  recipeService.setDeactivatedCategory(Number(req.params.id), req.body.deactivated));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addDiet = async (req, res) => {
    try {
        res.json(await  recipeService.addDiet(req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editDiet = async (req, res) => {
    try {
        res.json(await  recipeService.editDiet(Number(req.params.id), req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.setDeactivatedDiet = async (req, res) => {
    try {
        res.json(await  recipeService.setDeactivatedDiet(Number(req.params.id), req.body.deactivated));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addAllergen = async (req, res) => {
    try {
        res.json(await  recipeService.addAllergen(req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editAllergen = async (req, res) => {
    try {
        res.json(await  recipeService.editAllergen(Number(req.params.id), req.body.name));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.setDeactivatedAllergen = async (req, res) => {
    try {
        res.json(await  recipeService.setDeactivatedAllergen(Number(req.params.id), req.body.deactivated));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllCosts = async (req, res) => {
    try {
        res.json(await recipeService.getAllCosts());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllRecipes = async (req, res) => {
    try {
        res.json(await recipeService.getAllRecipes(req.params.sortBy, Number(req.params.page), req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editRecipeAdmin = async (req, res) => {
    try {
        res.json( await recipeService.editRecipeAdmin(Number(req.params.id), req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteRecipeAdmin = async (req, res) => {
    try {
        res.json(await recipeService.deleteRecipeAdmin(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllComments = async (req, res) => {
    try {
        res.json(await recipeService.getAllComments(req.params.sortBy, Number(req.params.page), req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editCommentAdmin = async (req, res) => {
    try {
        res.json( await recipeService.editCommentAdmin(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteCommentAdmin = async (req, res) => {
    try {
        res.json( await recipeService.deleteCommentAdmin(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getRankedCategories = async (req, res) => {
    try {
        res.json( await recipeService.getRankedCategories(Number(req.params.page)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}