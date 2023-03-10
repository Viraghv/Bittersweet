const HttpException = require('./HttpException');

/**
 * Class for the 400 BAD REQUEST http error response
 */

module.exports = class BadRequest extends HttpException {
    constructor(message) {
        super(message);
        this.code = 400;
    }
}