const { UnauthorizedError } = require("../service_errors");

function authorize(roles) {
    return (req, _res, next) => {
        if (roles.includes(req.auth?.urole) || req.auth?.urole === "admin") {
            next();
        } else {
            throw new UnauthorizedError();
        }
    };
}

module.exports = authorize;
