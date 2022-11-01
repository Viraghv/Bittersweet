const HttpException = require('./HttpException');

module.exports = class BadRequest extends HttpException {
    constructor(message) {
        super(message);
        this.code = 400;
    }
}