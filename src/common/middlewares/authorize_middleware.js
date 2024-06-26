const {UnauthorizedError} = require("../service_errors");
const {expressjwt: expressJwt} = require("express-jwt");
const generateJWT = require("../jwt_handler"); // Importer la fonction generateJWT

const secret = "secret";
const algorithms = ["HS256"];

// Middleware to validate JWT and refresh token if valid
const jwtMiddleware = (req, res, next) => {
    expressJwt({
        secret: secret,
        algorithms: algorithms,
        credentialsRequired: false,
    })(req, res, (err) => {
        if (err) {
            return res.status(401).json({message: "Invalid token"});
        }

        // If token is valid, refresh it
        if (req.auth) {
            const newToken = generateJWT(req.auth.uid, req.auth.urole);

            // Set the new token in the response header
            res.setHeader("Authorization", `Bearer ${newToken}`);
        }

        // Proceed to the next middleware
        next();
    });
};

// Fonction qui prend un tableau de rôles autorisés
function authorize(roles) {
    return (req, res, next) => {
        jwtMiddleware(req, res, (err) => {
            if (err) {
                return next(err);
            }

            if (roles.includes(req.auth && req.auth.urole) || (req.auth && req.auth.urole === "admin")) {
                next();
            } else {
                throw new UnauthorizedError("You do not have permission to perform this action.");
            }
        });
    };
}

module.exports = authorize;
