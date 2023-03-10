const {session} = require("../session/sessionStorage");
const Unauthorized = require("../exceptions/Unauthorized");

/**
 * Checks whether client has an existing session, and if it's expired.
 * If not, sends back a http error response to client, otherwise lets the request through.
 * @param req request object
 * @param res response object
 * @param next next object
 */
module.exports = (req, res, next) => {
    try {
        // does session exist
        const sessionToken = req.headers.authorization;
        if(!session[sessionToken]){
            throw new Unauthorized("User not logged in.");
        }

        // is it expired
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

