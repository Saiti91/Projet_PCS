// apartments/controller.js
const {Router} = require("express");
const apartmentsServices = require("./service");
const {NotFoundError} = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");
const upload = require("../common/middlewares/uploads_middleware");

const controller = Router();

controller.get("/", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getAll();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/request", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getAllRequest();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/apartmentsTypes", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getApartmentsTypes();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/apartmentFeatures", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getApartmentFeatures();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/carousel", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getCarousel();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/carousel/:id", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getApartmentImageById(Number(req.params.id));
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/:id", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getOne(Number(req.params.id));
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

controller.get("/request/:id", async (req, res, next) => {
    try {
        const data = await apartmentsServices.getOneRequest(Number(req.params.id));
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// Updated endpoint to handle file uploads
controller.post("/", authorize(["staff", "admin"]), upload.array('images', 5), async (req, res, next) => {
    try {
        const data = await apartmentsServices.createOne(req.body, req.files);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});
// Updated endpoint to handle file uploads
controller.post("/request", authorize(["staff", "admin"]), upload.array('images', 5), async (req, res, next) => {
    try {
        const data = await apartmentsServices.requestCreateOne(req.body, req.files);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});

controller.delete("/:id", authorize(["staff", "owner", "admin"]), async (req, res, next) => {
    try {
        const id = await apartmentsServices.deleteOne(Number(req.params.id));
        if (id === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(204).json();
    } catch (err) {
        next(err);
    }
});

controller.delete("/:id", authorize(["staff", "owner", "admin"]), async (req, res, next) => {
    try {
        const id = await apartmentsServices.deleteRequestedOne(Number(req.params.id));
        if (id === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(204).json();
    } catch (err) {
        next(err);
    }
});

controller.patch("/:id", authorize(["staff", "owner"]), async (req, res, next) => {
    try {
        const data = await apartmentsServices.updateOne(Number(req.params.id), req.body);
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = controller;
