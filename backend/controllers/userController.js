const userService = require('../services/userService')
const HttpException = require('../exceptions/HttpException')
const uuid = require("uuid");
const {Session, session} = require("../session/sessionStorage");
const BadRequest = require("../exceptions/BadRequest");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");
const fs = require("fs");
const NotFound = require("../exceptions/NotFound");
const path = require("path");

/**
 * Controller function for registering a new user.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for logging in as an existing user.
 * After validating login information, generates sessionToken and expiry date and stores it in the session object.
 * Sends response to client with their session token in it.
 * @param req request object
 * @param res response object
 */
module.exports.login = async (req, res) => {
    try {
        // check login info
        let userId =  await userService.login(req.body);
        // generate session token
        const sessionToken = uuid.v4();
        // calculate expiry date
        const expiresAt = new Date(Date.now() + 24*60*60*1000);
        //store in session
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

/**
 * Controller function for logging out as a logged-in user.
 * Deletes user's session token from session object.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for verifying email of user by their generated JWT.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for generating new password for user and sending it to their email address.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting data of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting admin attribute of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting user's uploaded recipe count by userId.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting user profile picture by filename.
 * Loads profile picture from file and sends it to the client in base64 encoding as the response.
 * @param req request object
 * @param res response object
 */
module.exports.getPfp = async (req, res) => {
    try {
        // construct file path
        let dir = __dirname.substring(0, __dirname.lastIndexOf(path.sep));
        let img = dir + `/uploads/pfps/${req.params.filename}`;

        // read the image file
        fs.readFile(img, function (err, content) {
            if (err) {
                // reading file unsuccessful, send http exception
                sendHttpException(res, new NotFound(["Profile picture not found."]));
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
 * Controller function for getting all recipeIds that current user has commented on.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all recipeIds of recipes uploaded by current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting all recipe cards of recipes uploaded by current user, sorted and paginated.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for changing password of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for editing profile data of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for uploading profile picture for current user.
 * Identifies user by session token, and sends response to client.
 * Throws error if there were any errors during file validation.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for editing weekly menu preferences of current user.
 * Identifies user by session token, and sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting user data by userId as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getUserAdmin = async (req, res) => {
    try {
        res.json( await userService.getUserById(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting all users as admin, filtered, sorted, and paginated.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting number of all registered users as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllUsersCount = async (req, res) => {
    try {
        res.json(await userService.getAllUsersCount(req.body));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for editing profile of user by userId as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.editProfileAdmin = async (req, res) => {
    try {
        res.json( await userService.editProfileAdmin(req.body, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for uploading profile picture for user by userId as admin.
 * Sends response to client.
 * Throws error if there were any errors during file validation.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for changing password of user by userId as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for setting verified attribute of user by userId as admin.
 * Identifies admin user by session token so admin cannot set attribute for themselves.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.setVerifiedAdmin = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        // if admin tries to set attribute for self, send http exception
        if(userId === Number(req.params.id)) {
            throw new BadRequest(["You cannot set the verification for yourself."]);
        }

        res.json( await userService.setVerified(req.body.verified, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for setting admin attribute of user by userId as admin.
 * Identifies admin user by session token so admin cannot set attribute for themselves.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.setAdmin = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        // if admin tries to set attribute for self, send http exception
        if(userId === Number(req.params.id)) {
            throw new BadRequest(["You cannot set the admin role for yourself."]);
        }

        res.json( await userService.setAdmin(req.body.admin, Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for deleting user by userId as admin.
 * Identifies admin user by session token so admin cannot delete their own account.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.deleteUserAdmin = async (req, res) => {
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    try {
        // if admin tries to delete their own account, send http exception
        if(userId === Number(req.params.id)) {
            throw new BadRequest(["You cannot delete your own account."]);
        }

        res.json( await userService.deleteUserById(Number(req.params.id)));
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for getting user ranking as admin.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
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

/**
 * Controller function for getting count of all verified users.
 * Sends response to client.
 * @param req request object
 * @param res response object
 */
module.exports.getAllVerifiedUserCount = async (req, res) => {
    try {
        res.json( await userService.getAllVerifiedUserCount());
    } catch (exception) {
        if (exception instanceof HttpException){
            sendHttpException(res, exception);
            return;
        }
        sendServerErrorResponse(res, exception.message);
    }
}

/**
 * Controller function for checking if current user is logged in.
 * Sends empty response to client (if request got through middleware, the user is logged in).
 * @param req request object
 * @param res response object
 */
module.exports.isLoggedIn = (req, res) => {
    res.end();
}

/**
 * Controller function for refreshing session token of current user.
 * Calculates new expiry date and updates it in session object.
 * Sends new expiration date to client.
 * @param req request object
 * @param res response object
 */
module.exports.refreshToken = (req, res) => {
    const token = req.headers.authorization;

    // get current user session
    const userSession = session[token];
    // calculate new expiry date
    const newExpirationDate = new Date(Date.now() + 24*60*60*1000);
    // set new expiration date
    userSession.expiresAt = newExpirationDate;

    res.json({newExpirationDate});
}