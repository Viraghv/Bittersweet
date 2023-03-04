const {session} = require("../session/sessionStorage");
const Unauthorized = require("../exceptions/Unauthorized");

module.exports = (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization;
        if(!session[sessionToken]){
            throw new Unauthorized("User not logged in.");
        }

        const storedSessionToken = session[sessionToken];
        if(storedSessionToken.isExpired()){
            delete session[sessionToken];
            throw new Unauthorized("Token expired.");
        }

        next();
    } catch (exception){
        res.status(exception.code).json({errorMessage: [exception.message]});
    }
}

