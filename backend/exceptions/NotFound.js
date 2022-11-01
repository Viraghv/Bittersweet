const HttpException = require('./HttpException');

module.exports = class NotFound extends HttpException {
    constructor(message) {
        super(message);
        this.code = 404;
    }
}