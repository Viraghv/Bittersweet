const HttpException = require('./HttpException');

/**
 * Class for the 404 NOT FOUND http error response
 */

module.exports = class NotFound extends HttpException {
    constructor(message) {
        super(message);
        this.code = 404;
    }
}