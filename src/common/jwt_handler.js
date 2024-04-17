const jwt = require("jsonwebtoken");

function generateJWT(userId, role) {
    return jwt.sign(
        {
            uid: userId,
            urole: role,
        },
        "secret"
    );
}

module.exports = generateJWT;
