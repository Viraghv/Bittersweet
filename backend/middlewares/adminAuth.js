const {session} = require("../session/sessionStorage");
const Unauthorized = require("../exceptions/Unauthorized");
const userService = require("../services/userService");


module.exports = async (req, res, next) => {
    try {
        const sessionToken = req.headers.authorization;
        if (!session[sessionToken]) {
            throw new Unauthorized("User not logged in.");
        }

        const storedSessionToken = session[sessionToken];

        if (storedSessionToken.isExpired()) {
            delete session[sessionToken];
            throw new Unauthorized("Token expired.");
        }

        let userId = session[sessionToken].userId;

        if (!(await userService.isAdmin(userId))) {
            throw new Unauthorized("User is not an admin.");
        }

        next();
    } catch (exception) {
        res.status(exception.code).json({errorMessage: [exception.message]});
    }

}