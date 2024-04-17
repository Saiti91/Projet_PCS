const express = require("express");
const bodyParser = require("body-parser");
const errorHandlingMiddleware = require("./common/middlewares/error_middleware");
const locationsController = require("./locations/controller");
const usersController = require("./users/controller");
const reservationsController = require("./reservations/controller");
const authController = require("./auth/controller");
const idParamGuard = require("./common/middlewares/id_param_guard_middleware");
const swaggerUI = require("swagger-ui-express");
const { specs } = require("./common/swagger_handler");
const authMiddleware = require("./common/middlewares/auth_middleware");

const app = express();
const port = 80;

app.use("/doc", swaggerUI.serve);
app.get("/doc", swaggerUI.setup(specs, { explorer: true }));

// Parse json body into object
app.use(bodyParser.json());

// parse token
app.use(authMiddleware);

// Uncomment and adjust as needed for your application logic
// app.use("/*/[1-9]+$", idParamGuard);

app.get("/", (_req, res) => {
    res.json({
        message: "Welcome to RESTpastrop API!",
        routes: ["/users", "/auth", "/locations", "/reservations", "/doc"],
    });
});

app.use("/locations", locationsController);
app.use("/users", usersController);
app.use("/reservations", reservationsController);
app.use("/auth", authController);

app.use(errorHandlingMiddleware);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
