const userService = require('../services/userService')
const HttpException = require('../exceptions/HttpException')
const uuid = require("uuid");
const {Session, session} = require("../session/sessionStorage");
const NotAuthorized = require("../exceptions/NotAuthorized");
const BadRequest = require("../exceptions/BadRequest");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const fs = require("fs");
const NotFound = require("../exceptions/NotFound");


module.exports.register = async (req, res) => {
    try {
        res.json( await userService.register(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.login = async (req, res) => {
    try {
        let userId =  await userService.login(req.body);
        const sessionToken = uuid.v4();
        const expiresAt = new Date(Date.now() + 24*60*60*1000);
        session[sessionToken] = new Session(userId, expiresAt);
        res.json({sessionToken: sessionToken});
    } catch (exception){
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.logout = (req, res) => {
    try {
        const sessionToken = req.headers.authorization;

        console.log(session, sessionToken);

        if(!session[sessionToken]){
            throw new BadRequest("User not logged in.");
        }

        delete session[sessionToken];
        res.end();
    } catch (exception){
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getUploadedRecipeCountById = async (req, res) => {
    try {
        res.json( await userService.getUploadedRecipeCountById(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getPfp = async (req, res) => {
    try {
        let dir = __dirname.substring(0, __dirname.lastIndexOf("\\"));
        let img = dir + `\\uploads\\pfps\\${req.params.filename}`;

        fs.readFile(img, function (err, content) {
            if (err) {
                sendHttpException(res, new NotFound(["Profile picture not found."]));
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

module.exports.createGroupForCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.createGroupForCurrentUser(req.body.name, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.getUserById(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getCurrentUserAllRecipesWithComments = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.getUsersAllRecipesWithCommentsById(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getCurrentUserAllRecipeIds = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.getUsersAllRecipeIds(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllGroupsOfCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.getAllGroupsOfUserById(userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllGroupsOfFavourite = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json(await userService.getAllGroupsOfFavouriteById(Number(req.params.id), Number(userId)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.addRecipeToGroup = async (req, res) => {
    try {
        res.json( await userService.addRecipeToGroup(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editNameOfGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.editNameOfGroup(Number(req.body.groupId), req.body.newName, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.deleteGroup(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteRecipeFromGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.deleteRecipeFromGroup(Number(req.body.groupId), Number(req.body.recipeId), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllRecipeCardsOfGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json(await userService.getAllRecipeCardsOfGroup(req.params.sortBy, Number(req.params.id), Number(req.params.page), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getRecipeCountOfGroup = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json(await userService.getRecipeCountOfGroup(Number(req.params.id), userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getSessionState = (req, res) => {
    res.json(session);
}

module.exports.isLoggedIn = (req, res) => {
    res.end();
}

module.exports.refreshToken = (req, res) => {
    const token = req.headers.authorization;

    const userSession = session[token];
    const newExpirationDate = new Date(Date.now() + 24*60*60*1000);
    userSession.expiresAt = newExpirationDate;

    res.json({newExpirationDate});
}