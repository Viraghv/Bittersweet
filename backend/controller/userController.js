const userService = require('../services/userService')
const HttpException = require('../exceptions/HttpException')
const BadRequest = require("../exceptions/BadRequest");
const uuid = require("uuid");
const {Session, session} = require("../session/sessionStorage");

function sendServerErrorResponse(res, message = "Something unexpected happened!") {
    res.status(500).json({errorMessage: message});
}

function sendHttpException(res, httpException){
    res.status(httpException.code).json({errorMessage: httpException.message});
}

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

module.exports.getSessionState = (req, res) => {
    res.json(session);
}