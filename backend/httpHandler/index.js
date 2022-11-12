function sendServerErrorResponse(res, message = "Something unexpected happened!") {
    res.status(500).json({errorMessage: message});
}

function sendHttpException(res, httpException){
    res.status(httpException.code).json({errorMessage: httpException.message});
}

module.exports = {
    sendServerErrorResponse,
    sendHttpException,
}