const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const basePath = path.join(__dirname, "..");

const options = {
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PCS_API",
            version: "1.0.0",
            description: "This API allows managing apartments for a company renting private people's properties.",
        },
    },
    // Ensure to change "*.ts" to "*.js" for JavaScript files
    apis: [path.join(basePath, "**", "*.js"), path.join(basePath, "index.js")],
};

const specs = swaggerJsdoc(options);

module.exports = { specs };
