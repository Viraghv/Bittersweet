const userService = require('../services/userService')
const HttpException = require('../exceptions/HttpException')
const uuid = require("uuid");
const {Session, session} = require("../session/sessionStorage");
const NotAuthorized = require("../exceptions/NotAuthorized");
const BadRequest = require("../exceptions/BadRequest");
const {sendHttpException, sendServerErrorResponse} = require("../httpHandler");


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