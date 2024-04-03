class HTTPError extends Error {
    constructor(message) {
        super(message);
        this.status = 500;
    }
}

class NotFoundError extends HTTPError {
    constructor(message) {
        super(message);
        this.status = 404;
    }
}

module.exports = { HTTPError, NotFoundError };
