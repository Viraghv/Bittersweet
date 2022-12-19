const recipeService = require('../services/recipeService')
const HttpException = require("../exceptions/HttpException");
const NotFound = require("../exceptions/NotFound");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");
const fs = require("fs");


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
        res.json(await recipeService.uploadImage(req.file, req.params.id, req.fileValidationErrors));
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
        let dir = __dirname.substring(0, __dirname.lastIndexOf("\\"));
        let img = dir + `\\uploads\\recipe_images\\${req.params.filename}`;

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

module.exports.getAllUnits = async (req, res) => res.json(await recipeService.getAllUnits());

module.exports.getAllDifficulties = async (req, res) => res.json(await recipeService.getAllDifficulties());

module.exports.getAllCategories = async (req, res) => res.json(await recipeService.getAllCategories());

module.exports.getAllAllergens = async (req, res) => res.json(await  recipeService.getAllAllergens());

module.exports.getAllCosts = async (req, res) => res.json(await recipeService.getAllCosts());