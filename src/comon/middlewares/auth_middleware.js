const { expressjwt: jwt } = require("express-jwt");

module.exports = jwt({
    secret: "secret",
    algorithms: ["HS256"],
    credentialsRequired: false,
});
