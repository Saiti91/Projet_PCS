const { Router } = require("express");
const Service = require("./service");
const NotFoundError = require("../common/http_errors").NotFoundError;
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get(
    "/",
    authorize(["staff"]),
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
        Service.getOne(Number(req.params.id), {
            id: req.auth?.uid,
            role: req.auth?.urole,
        })
            .then((data) => {
                if (data === null) {
                    throw new NotFoundError(
                        `Could not find user with id ${req.params.id}`
                    );
                }

                res.json(data);
            })
            .catch((err) => next(err));
    },
);

controller.post(
    "/",
    authorize(["staff"]),
    (req, res, next) => {
        Service.createOne(req.body)
            .then((data) => {
                res.status(201).json(data);
            })
            .catch((err) => next(err));
    },
);

controller.delete(
    "/:id",
    authorize(["owner", "customer", "staff"]),
    (req, res, next) => {
        Service.deleteOne(Number(req.params.id), {
            id: req.auth?.uid,
            role: req.auth?.urole,
        })
            .then((id) => {
                if (id === null) {
                    throw new NotFoundError(
                        `Could not find user with id ${req.params.id}`
                    );
                }

                res.status(204).json();
            })
            .catch((err) => next(err));
    },
);

controller.patch(
    "/:id",
    authorize(["owner", "customer", "staff"]),
    (req, res, next) => {
        Service.updateOne(Number(req.params.id), req.body, {
            id: req.auth?.uid,
            role: req.auth?.urole,
        })
            .then((data) => {
                if (data === null) {
                    throw new NotFoundError(
                        `Could not find user with id ${req.params.id}`
                    );
                }
                res.status(200).json(data);
            })
            .catch((err) => next(err));
    },
);

module.exports = controller;
