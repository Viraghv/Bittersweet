const userService = require('../services/userService')
const HttpException = require('../exceptions/HttpException')
const uuid = require("uuid");
const {Session, session} = require("../session/sessionStorage");
const BadRequest = require("../exceptions/BadRequest");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const fs = require("fs");
const NotFound = require("../exceptions/NotFound");
const path = require("path");


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

module.exports.verification = async (req, res) => {
    try {
        res.json( await userService.verification(req.params.token));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.forgotPassword = async (req, res) => {
    try {
        res.json( await userService.forgotPassword(req.body.email));
    } catch (exception) {
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
        let dir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
        let img = dir + `/uploads/pfps/${req.params.filename}`;

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

module.exports.isCurrentUserAdmin = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.isAdmin(userId));
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

module.exports.getCurrentUserAllRecipeCards = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.getUsersAllRecipeCards(userId, req.params.sortBy, Number(req.params.page)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllUserCount = async (req, res) => {
    try {
        res.json( await userService.getAllUserCount());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getAllActiveUserCount = async (req, res) => {
    try {
        res.json( await userService.getAllActiveUserCount());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.changePasswordOfCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.changePasswordOfUser(req.body, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editProfileOfCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json( await userService.editProfileOfUser(req.body, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.uploadImageForCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        if(req.fileValidationErrors.length > 0){
            throw new BadRequest(req.fileValidationErrors);
        }

        res.json(await userService.uploadImage(req.file, userId));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }

}

module.exports.editPreferencesCurrentUser = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        res.json(await userService.editPreferencesOfUser(req.body, userId));
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

module.exports.getAllUsers = async (req, res) => {
    try {
        res.json(await userService.getAllUsers(req.params.sortBy, Number(req.params.page), req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.editProfileAdmin = async (req, res) => {
    try {
        res.json( await userService.editProfileOfUser(req.body, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.changePasswordOfUserAdmin = async (req, res) => {
    try {
        res.json( await userService.changePasswordOfUserAdmin(req.body, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.uploadImageAdmin = async (req, res) => {
    try {
        if(req.fileValidationErrors.length > 0){
            throw new BadRequest(req.fileValidationErrors);
        }

        res.json(await userService.uploadImage(req.file, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }

}

module.exports.setVerifiedAdmin = async (req, res) => {
    try {
        res.json( await userService.setVerified(req.body.verified, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.setAdmin = async (req, res) => {
    try {
        res.json( await userService.setAdmin(req.body.admin, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.deleteUserAdmin = async (req, res) => {
    try {
        res.json( await userService.deleteUserById(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

module.exports.getRankedUsers = async (req, res) => {
    try {
        res.json( await userService.getRankedUsers(Number(req.params.page)));
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