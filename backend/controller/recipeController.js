const recipeService = require('../services/recipeService')
const HttpException = require("../exceptions/HttpException");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const {session} = require("../session/sessionStorage");


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

module.exports.getAllUnits = async (req, res) => res.json(await recipeService.getAllUnits());

module.exports.getAllDifficulties = async (req, res) => res.json(await recipeService.getAllDifficulties());

module.exports.getAllCategories = async (req, res) => res.json(await recipeService.getAllCategories());

module.exports.getAllAllergens = async (req, res) => res.json(await  recipeService.getAllAllergens());

module.exports.getAllCosts = async (req, res) => res.json(await recipeService.getAllCosts());