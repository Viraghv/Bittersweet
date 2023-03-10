const recipeService = require('../services/recipeService')
const HttpException = require("../exceptions/HttpException");
const NotFound = require("../exceptions/NotFound");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");
const fs = require("fs");
const userService = require("../services/userService");
const BadRequest = require("../exceptions/BadRequest");
const path = require("path");

/**
 * Controller function for creating new recipe for current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for uploading new image for recipe by recipeId.
 * Checks if there were any errors during validation, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for editing recipe of current user by recipeId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting recipe of current user by recipeId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting a recipe by recipeId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting recipe image by filename.
 * Loads recipe image from file and sends it to the client in base64 encoding as the response.
 * @param req request object
 * @param res response object
 */
module.exports.getRecipeImage = async (req, res) => {
    try {
        // construct file path
        let dir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
        let img = dir + `/uploads/recipe_images/${req.params.filename}`;

        // read the image file
        fs.readFile(img, function (err, content) {
            if (err) {
                // reading file unsuccessful, send http exception
                sendHttpException(res, new NotFound(["Recipe image not found."]));
            } else {
                // reading file successful, send image
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

/**
 * Controller function for getting the count of all recipes.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all recipe cards, paginated.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllRecipeCardsWithPagination = async (req, res) => {
    try {
        res.json( await recipeService.getAllRecipeCardsWithPagination(Number(req.params.page)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting filtered recipe cards, sorted, paginated.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting comments by recipeId, paginated.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getCommentsByRecipeId = async (req, res) => {
    try {
        res.json( await recipeService.getCommentsByRecipeId(Number(req.params.recipeId), Number(req.params.page)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting comment count of recipe by recipeId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getCommentCountById = async (req, res) => {
    try {
        res.json( await recipeService.getCommentCountById(Number(req.params.recipeId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting average rating of recipe by recipeId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAverageRatingById = async (req, res) => {
    try {
        res.json( await recipeService.getAverageRatingById(Number(req.params.recipeId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for adding comment of current user to recipe.
 * Checks whether the user is trying to comment on their own recipe, or on one they have already commented on.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.addComment = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        // check if user has already commented on recipe
        let commentedRecipeIds = await userService.getUsersAllRecipesWithCommentsById(userId);

        if (!commentedRecipeIds.includes(Number(req.body.recipeId))){
            // check if recipe is user's own recipe
            let usersRecipes = await userService.getUsersAllRecipeIds(userId);

            if (!usersRecipes.includes(Number(req.body.recipeId))){
                res.json( await recipeService.addComment(req.body, userId));
            } else {
                // recipe is user's recipe, error response
                throw new BadRequest(["A user can't comment on their own recipe."]);
            }
        } else {
            // user has already commented on recipe, error response
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

/**
 * Controller function for editing comment of current user by commentId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.editComment = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.editComment(Number(req.params.id), req.body, Number(userId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for deleting comment of current user by commentId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteComment = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.deleteComment(Number(req.params.id), Number(userId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting comment of current user by recipeId.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getCommentOfCurrentUserByRecipeId = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await recipeService.getCommentByUserAndRecipeId(Number(req.params.recipeId), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting all difficulties.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all costs.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all units.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all recipe categories.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all diets.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all allergens.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for adding a new unit.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for editing unit by unitId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting unit by unitId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteUnit = async (req, res) => {
    try {
        res.json(await  recipeService.deleteUnit(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for adding a new recipe category.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for editing recipe category by categoryId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting recipe category by categoryId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteCategory = async (req, res) => {
    try {
        res.json(await  recipeService.deleteCategory(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting ranked categories, paginated.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting count of all recipe categories.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getCategoriesCount = async (req, res) => {
    try {
        res.json( await recipeService.getCategoriesCount());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for adding new diet.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for editing diet by dietId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting diet by dietId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteDiet = async (req, res) => {
    try {
        res.json(await  recipeService.deleteDiet(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for adding new allergen.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for editing allergen by allergenId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting allergen by allergenId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteAllergen = async (req, res) => {
    try {
        res.json(await  recipeService.deleteAllergen(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting all recipes, sorted, paginated.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting the count of all recipes as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllAdminPageRecipesCount = async (req, res) => {
    try {
        res.json( await recipeService.getAllAdminPageRecipesCount(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for editing recipe by recipeId as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for deleting recipe by recipeId as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all comments as admin, sorted, paginated.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting the count of all comments as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllAdminPageCommentsCount = async (req, res) => {
    try {
        res.json(await recipeService.getAllAdminPageCommentsCount(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for editing comment by commentId as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.editCommentAdmin = async (req, res) => {
    try {
        res.json( await recipeService.editCommentAdmin(Number(req.params.id), req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for deleting comment by commentId as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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