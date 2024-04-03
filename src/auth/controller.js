const { Router } = require("express");
const authService = require("./service");

const controller = Router();

controller.post("/login", (req, res, next) => {
    authService
        .login(req.body)
        .then((token) => {
            res.send({
                token: token,
            });
        })
        .catch((err) => {
            next(err);
        });
});

controller.post("/register", (req, res, next) => {
    authService
        .register(req.body) // Assuming `req.body` will be in the correct format for your user.
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = controller;
