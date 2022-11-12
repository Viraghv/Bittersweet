const {session} = require("../session/sessionStorage");
const NotAuthorized = require("../exceptions/NotAuthorized");


module.exports = (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization;
        if(!session[sessionToken]){
            throw new NotAuthorized("User not logged in.");
        }

        const storedSessionToken = session[sessionToken];

        if(storedSessionToken.isExpired()){
            delete session[sessionToken];
            throw new NotAuthorized("Token expired.");
        }

        next();
    } catch (exception){
        res.status(exception.code).json({errorMessage: [exception.message]});
    }

}