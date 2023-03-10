const HttpException = require('./HttpException');

/**
 * Class for the 401 UNAUTHORIZED http error response
 */

module.exports = class Unauthorized extends HttpException {
    constructor(message) {
        super(message);
        this.code = 401;
    }
}