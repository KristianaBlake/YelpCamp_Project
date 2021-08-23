class ExpressError extends Error {
    constructor(message, statusCode) {
        // this is going to call the Error constructor 
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError; 