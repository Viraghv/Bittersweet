/**
 * Sends a 500 INTERNAL SERVER ERROR response to the client with the given message
 * @param res response object
 * @param message  the error message
 */
function sendServerErrorResponse(res, message = "Something unexpected happened!") {
    res.status(500).json({errorMessage: message});
}

/**
 * Sends the given http error response to the client
 * @param res response object
 * @param httpException object of class that extends HttpException
 */
function sendHttpException(res, httpException){
    res.status(httpException.code).json({errorMessage: httpException.message});
}

module.exports = {
    sendServerErrorResponse,
    sendHttpException,
}