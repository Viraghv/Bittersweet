const HttpException = require('./HttpException');

module.exports = class Unauthorized extends HttpException {
    constructor(message) {
        super(message);
        this.code = 401;
    }
}