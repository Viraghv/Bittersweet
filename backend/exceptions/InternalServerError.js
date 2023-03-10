const HttpException = require('./HttpException');

/**
 * Class for the 500 INTERNAL SERVER ERROR http error response
 */

module.exports = class InternalServerError extends HttpException {
    constructor(message) {
        super(message);
        this.code = 500;
    }
}