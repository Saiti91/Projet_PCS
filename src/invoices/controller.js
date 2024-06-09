const { Router } = require("express");
const invoiceServices = require("../services/invoiceService");
const { NotFoundError } = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get("/", authorize(["admin", "staff", "owner", "provider"]), async (req, res, next) => {
    try {
        const data = await invoiceServices.getAllInvoices();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/:id", authorize(["admin", "staff", "owner", "provider"]), async (req, res, next) => {
    try {
        const data = await invoiceServices.getInvoiceById(Number(req.params.id));
        if (data === null) {
            throw new NotFoundError(`Could not find invoice with id ${req.params.id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/", authorize(["admin", "staff"]), async (req, res, next) => {
    try {
        const data = await invoiceServices.createInvoice(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

controller.patch("/:id", authorize(["admin", "staff"]), async (req, res, next) => {
    try {
        const data = await invoiceServices.updateInvoice(Number(req.params.id), req.body);
        if (data === null) {
            throw new NotFoundError(`Could not find invoice with id ${req.params.id}`);
        }
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = controller;
