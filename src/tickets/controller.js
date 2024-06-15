const {Router} = require("express");
const ticketServices = require("./service");
const {NotFoundError} = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get("/", authorize(["admin", "staff", "owner", "customer", "provider"]), async (req, res, next) => {
    try {
        const data = await ticketServices.getAllTickets();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/:id", authorize(["admin", "staff", "owner", "customer", "provider"]), async (req, res, next) => {
    try {
        const data = await ticketServices.getTicketById(Number(req.params.id));
        if (data === null) {
            throw new NotFoundError(`Could not find ticket with id ${req.params.id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/", authorize(["admin", "staff", "owner", "customer", "provider"]), async (req, res, next) => {
    try {
        const data = await ticketServices.createTicket(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

controller.patch("/:id", authorize(["admin", "staff", "owner", "customer", "provider"]), async (req, res, next) => {
    try {
        const data = await ticketServices.updateTicket(Number(req.params.id), req.body);
        if (data === null) {
            throw new NotFoundError(`Could not find ticket with id ${req.params.id}`);
        }
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = controller;
