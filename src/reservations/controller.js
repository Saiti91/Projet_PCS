const {Router} = require("express");
const reservationService = require("./service");
const {NotFoundError} = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get(
    "/",
    authorize(["staff", "customer", "owner", "provider"]),
    (_req, res, next) => {
        reservationService.getAll()
            .then((data) => res.json(data))
            .catch((err) => next(err));
    },
);

controller.get(
    "/:id",
    authorize(["staff", "customer", "owner", "provider"]),
    (req, res, next) => {
        reservationService.getOne(Number(req.params.id))
            .then((data) => {
                if (!data) {
                    throw new NotFoundError(`Could not find reservation with id ${req.params.id}`);
                }
                res.json(data);
            })
            .catch((err) => next(err));
    },
);

controller.post("/", authorize(["customer", "owner"]), (req, res, next) => {
    const reservationData = {
        customer: req.auth?.uid,
        date_start: req.body.date_start,
        date_end: req.body.date_end,
        services: req.body.services,
        price: req.body.totalPrice,
        apartment_id: req.body.apartment_id,
    };

    reservationService.createOne(reservationData)
        .then((data) => res.status(201).json(data))
        .catch((err) => next(err));
});

controller.delete(
    "/:id",
    authorize(["staff", "owner", "customer", "provider"]),
    (req, res, next) => {
        reservationService.deleteOne(Number(req.params.id))
            .then((id) => {
                if (!id) {
                    throw new NotFoundError(`Could not find reservation with id ${req.params.id}`);
                }
                res.status(204).send();
            })
            .catch((err) => next(err));
    },
);

controller.patch(
    "/:id",
    authorize(["staff", "owner", "customer", "provider"]),
    (req, res, next) => {
        reservationService.updateOne(Number(req.params.id), {
            ...req.body,
            date_start: new Date(req.body.date_start),
            date_end: new Date(req.body.date_end),
        })
            .then((data) => {
                if (!data) {
                    throw new NotFoundError(`Could not find reservation with id ${req.params.id}`);
                }
                res.status(200).json(data);
            })
            .catch((err) => next(err));
    },
);

module.exports = controller;
