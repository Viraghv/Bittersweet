const {session} = require("../session/sessionStorage");
const NotAuthorized = require("../exceptions/NotAuthorized");
const userService = require("../services/userService");


module.exports = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization;
        if (!session[sessionToken]) {
            throw new NotAuthorized("User not logged in.");
        }

        const storedSessionToken = session[sessionToken];

        if (storedSessionToken.isExpired()) {
            delete session[sessionToken];
            throw new NotAuthorized("Token expired.");
        }

        let userId = session[sessionToken].userId;

        if (!(await userService.isAdmin(userId))) {
            throw new NotAuthorized("User is not an admin.");
        }

        next();
    } catch (exception) {
        res.status(exception.code).json({errorMessage: [exception.message]});
    }

}