const express = require("express");
const bodyParser = require("body-parser");
const errorHandlingMiddleware = require("./common/middlewares/error_middleware");
const appartementsController = require("./apartments/controller");
const usersController = require("./users/controller");
const reservationsController = require("./reservations/controller");
const servicesController = require("./services/controller");
const authController = require("./auth/controller");
const commentaryController = require("./commentary/controller");
const apartmentCalendarController = require("./apartmentCalendar/controller");
const serviceCalendarController = require("./serviceCalendar/controller");
const inventoryController = require("./inventory/controller");
const ticketsController = require("./tickets/controller");
const invoicesController = require("./invoices/controller");

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
        routes: ["/users", "/auth", "/apartments", "/reservations", "/services", "/calendar", "/commentary",
            "/apartmentsCalendar", "/servicesCalendar", "/inventory","/tickets","/invoices"],
    });
});

// importation des autres scripts
app.use("/apartmentsCalendar", apartmentCalendarController);
app.use("/apartments", appartementsController);
app.use("/auth", authController);
app.use("/commentary", commentaryController);
app.use("/inventory", inventoryController);
app.use("/invoices", invoicesController);
app.use("/reservations", reservationsController);
app.use("/servicesCalendar", serviceCalendarController);
app.use("/services", servicesController);
app.use("/tickets", ticketsController);
app.use("/users", usersController);

app.use(errorHandlingMiddleware);

//Console
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
