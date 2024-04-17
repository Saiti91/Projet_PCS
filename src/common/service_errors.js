class InvalidArgumentError extends Error {
    constructor(message) {
        super(message || "Something went wrong with the provided data.");
    }
}

class AuthError extends Error {
    constructor(message) {
        super(message || "An error prevented you from authenticating.");
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message || "You are not allowed to perform this action.");
    }
}

module.exports = { InvalidArgumentError, AuthError, UnauthorizedError };
