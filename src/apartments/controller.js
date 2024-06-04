const {Router} = require("express");
const appartementsServices = require("./service");
const {NotFoundError} = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");
const {createLocationSchema, updateLocationSchema} = require("./model");
const validate = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get("/", async (req, res, next) => {
    try {
        const data = await appartementsServices.getAll();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/carousel", async (req, res, next) => {
    try {
        const data = await appartementsServices.getCarousel();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/:id", async (req, res, next) => {
    try {
        const data = await appartementsServices.getOne(Number(req.params.id));
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.post("/", authorize(["staff", "admin"]), validate(createLocationSchema), async (req, res, next) => {
    try {
        const data = await appartementsServices.createOne(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

controller.delete("/:id", authorize(["staff", "owner", "admin"]), async (req, res, next) => {
    try {
        const id = await appartementsServices.deleteOne(Number(req.params.id));
        if (id === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(204).json();
    } catch (err) {
        next(err);
    }
});

controller.patch("/:id", authorize(["staff", "owner"]), validate(updateLocationSchema), async (req, res, next) => {
    try {
        const data = await appartementsServices.updateOne(Number(req.params.id), req.body);
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = controller;
