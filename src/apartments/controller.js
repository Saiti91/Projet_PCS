const { Router } = require("express");
const appartementsServices = require("./service");
const { Location, PartialLocation } = require("./model");
const { NotFoundError } = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get("/", (req, res, next) => {
    appartementsServices.getAll()
        .then((data) => res.json(data))
        .catch((err) => next(err));
});

controller.get("/carousel", (req, res, next) => {
    appartementsServices.getCarousel()
        .then((data) => res.json(data))
        .catch((err) => next(err));
});

controller.get("/:id", (req, res, next) => {
    appartementsServices.getOne(Number(req.params.id))
        .then((data) => {
            if (data === null) {
                throw new NotFoundError(
                    `Could not find location with id ${req.params.id}`,
                );
            }

            res.json(data);
        })
        .catch((err) => next(err));
});

controller.post("/", authorize(["staff","admin"]), (req, res, next) => {
    appartementsServices.createOne(req.body)
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) => next(err));
});

controller.delete("/:id", authorize(["staff", "owner"]), (req, res, next) => {
    appartementsServices.deleteOne(Number(req.params.id))
        .then((id) => {
            if (id === null) {
                throw new NotFoundError(
                    `Could not find location with id ${req.params.id}`,
                );
            }

            res.status(204).json();
        })
        .catch((err) => next(err));
});

controller.patch("/:id", authorize(["staff", "owner"]), (req, res, next) => {
    appartementsServices.updateOne(Number(req.params.id), req.body)
        .then((data) => {
            if (data === null) {
                throw new NotFoundError(
                    `Could not find location with id ${req.params.id}`,
                );
            }
            res.status(200).json(data);
        })
        .catch((err) => next(err));
});

module.exports = controller;
