const { Router } = require("express");
const service = require("./service");
const { NotFoundError } = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get("/", (req, res, next) => {
    service.getAll()
        .then((data) => res.json(data))
        .catch((err) => next(err));
});

controller.get("/:id", (req, res, next) => {
    service.getOne(Number(req.params.id))
        .then((data) => {
            if (data === null) {
                throw new NotFoundError(`Could not find location with id ${req.params.id}`);
            }
            res.json(data);
        })
        .catch((err) => next(err));
});

controller.post("/", authorize(["staff", "admin"]), (req, res, next) => {
    service.createOne(req.body)
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) => next(err));
});

controller.delete("/:id", authorize(["staff", "admin"]), (req, res, next) => {
    service.deleteOne(Number(req.params.id))
        .then((id) => {
            if (id === null) {
                throw new NotFoundError(`Could not find location with id ${req.params.id}`);
            }
            res.status(204).json();
        })
        .catch((err) => next(err));
});

controller.patch("/availability/:id", authorize(["staff", "provider", "admin", "owner"]), (req, res, next) => {
    console.log("Received PATCH request:", req.body);
    const apartmentId = Number(req.params.id);
    const { dates } = req.body;
    service.updateAvailabilities(apartmentId, dates)
        .then((data) => {
            if (data === null) {
                throw new NotFoundError(`Could not find apartment with id ${req.params.id}`);
            }
            res.status(200).json(data);
        })
        .catch((err) => {
            console.error("Error in PATCH /availability/:id:", err);
            next(err);
        });
});

module.exports = controller;
