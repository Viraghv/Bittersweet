const {session} = require("../session/sessionStorage");
const NotAuthorized = require("../exceptions/NotAuthorized");

module.exports = (req, res, next) => {
    try {
        const sessionToken = req.cookies.sessionToken;
        if(!session[sessionToken]){
            throw new NotAuthorized("User not logged in.");
        }

        const storedSessionToken = session[sessionToken];

        if(storedSessionToken.isExpired()){
            throw new NotAuthorized("Token expired.");
        }

        next();
    } catch (exception){
        res.status(exception.code).json({errorMessage: [exception.message]});
    }

}