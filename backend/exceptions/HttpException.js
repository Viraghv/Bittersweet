/**
 * General class for all http exception classes.
 */

module.exports = class HttpException {
    code;
    message;

    constructor(message = "Something went wrong!") {
        this.message = message;
    }
}