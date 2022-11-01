const HttpException = require('./HttpException');

module.exports = class NotAuthorized extends HttpException {
    constructor(message) {
        super(message);
        this.code = 401;
    }
}