const express = require("express");
const dotEnv = require("dotenv")
const bodyParser = require("body-parser");
const errorHandlingMiddleware = require("./common/middlewares/error_middleware");
const appartementsController = require("./appartements/controller");
const usersController = require("./users/controller");
const reservationsController = require("./reservations/controller");
const servicesController = require("./services/controller");
const authController = require("./auth/controller");
const idParamGuard = require("./common/middlewares/id_param_guard_middleware");
const authMiddleware = require("./common/middlewares/auth_middleware");
const cors = require("cors");

const app = express();
const port = 80;

// Transform le json en un objet utilisable dans le code
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:5173', // Remplacez par le domaine de votre application front-end
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: 'Authorization'
}));
// Transform le token en un objet utilisable dans le code
app.use(authMiddleware);


// Regex
app.use("/*/[1-9]+$", idParamGuard);

//Récupère la requete et délivre un message de base si celle ci ne contient pas d'argument
app.get("/", (_req, res) => {
    res.json({
        message: "Welcome to PCS API!",
        routes: ["/users", "/auth", "/appartements", "/reservations", "/doc","/services"],
    });
});

// importation des autres scripts
app.use("/appartements", appartementsController);
app.use("/auth", authController);
app.use("/reservations", reservationsController);
app.use("/services", servicesController);
app.use("/users", usersController);


app.use(errorHandlingMiddleware);

//Console
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
