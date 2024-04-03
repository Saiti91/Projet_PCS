const { Router } = require("express");
const Service = require("./service");
const NotFoundError = require("../common/http_errors").NotFoundError;
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get(
    "/",
    authorize(["staff", "customer", "owner"]),
    (_req, res, next) => {
        Service.getAll()
            .then((data) => res.json(data))
            .catch((err) => next(err));
    },
);

controller.get(
    "/:id",
    authorize(["staff", "customer", "owner"]),
    (req, res, next) => {
        Service.getOne(Number(req.params.id))
            .then((data) => {
                if (data === null) {
                    throw new NotFoundError(
                        `Could not find reservation with id ${req.params.id}`,
                    );
                }
                res.json(data);
            })
            .catch((err) => next(err));
    },
);

controller.post("/", (req, res, next) => {
    Service.createOne({
        ...req.body,
        customer: req.auth?.uid,
        date_start: new Date(req.body.date_start),
        date_end: new Date(req.body.date_end),
    })
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) => next(err));
});

controller.delete(
    "/:id",
    authorize(["staff", "owner", "customer"]),
    (req, res, next) => {
        Service.deleteOne(Number(req.params.id))
            .then((id) => {
                if (id === null) {
                    throw new NotFoundError(
                        `Could not find reservation with id ${req.params.id}`,
                    );
                }
                res.status(204).json();
            })
            .catch((err) => next(err));
    },
);

controller.patch(
    "/:id",
    authorize(["staff", "owner", "customer"]),
    (req, res, next) => {
        Service.updateOne(Number(req.params.id), {
            ...req.body,
            date_start: new Date(req.body.date_start),
            date_end: new Date(req.body.date_end),
        })
            .then((data) => {
                if (data === null) {
                    throw new NotFoundError(
                        `Could not find reservation with id ${req.params.id}`,
                    );
                }
                res.status(200).json(data);
            })
            .catch((err) => next(err));
    },
);

module.exports = controller;
