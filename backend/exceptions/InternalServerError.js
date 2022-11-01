const HttpException = require('./HttpException');

module.exports = class InternalServerError extends HttpException {
    constructor(message) {
        super(message);
        this.code = 500;
    }
}