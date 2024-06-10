const { Router } = require("express");
const inventoryServices = require("./service");
const { NotFoundError } = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get("/", async (req, res, next) => {
    try {
        const data = await inventoryServices.getAll();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/:id", async (req, res, next) => {
    try {
        const data = await inventoryServices.getOne(Number(req.params.id));
        if (data === null) {
            throw new NotFoundError(`Could not find inspection with id ${req.params.id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/pre-arrival", authorize(["staff", "admin"]), async (req, res, next) => {
    try {
        const data = await inventoryServices.createPreArrivalInspection(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/arrival", authorize(["staff", "admin"]), async (req, res, next) => {
    try {
        const data = await inventoryServices.confirmArrivalInspection(req.body);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/exit/client", authorize(["staff", "admin"]), async (req, res, next) => {
    try {
        const data = await inventoryServices.createExitInspectionByClient(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/exit/pcs", authorize(["staff", "admin"]), async (req, res, next) => {
    try {
        const data = await inventoryServices.createExitInspectionByPCS(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = controller;
