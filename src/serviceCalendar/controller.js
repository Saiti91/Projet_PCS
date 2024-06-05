// serviceCalendar/controller.js
const {Router} = require("express");
const service = require("./service");
const {NotFoundError} = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

// Route GET pour récupérer toutes les disponibilités
controller.get("/", (req, res, next) => {
    service.getAll()
        .then((data) => res.json(data))
        .catch((err) => next(err));
});

// Route GET pour récupérer une disponibilité spécifique par ID
controller.get("/:id", (req, res, next) => {
    service.getOne(Number(req.params.id))
        .then((data) => {
            if (data === null) {
                throw new NotFoundError(`Could not find availability with id ${req.params.id}`);
            }
            res.json(data);
        })
        .catch((err) => next(err));
});

// Route POST pour créer une nouvelle disponibilité
controller.post("/", authorize(["staff", "admin"]), (req, res, next) => {
    service.createOne(req.body)
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) => next(err));
});

// Route DELETE pour supprimer une disponibilité par ID
controller.delete("/:id", authorize(["staff", "admin"]), (req, res, next) => {
    service.deleteOne(Number(req.params.id))
        .then((id) => {
            if (id === null) {
                throw new NotFoundError(`Could not find availability with id ${req.params.id}`);
            }
            res.status(204).send();
        })
        .catch((err) => next(err));
});

// Route PATCH pour mettre à jour une disponibilité spécifique
controller.patch("/:id", authorize(["staff", "provider", "admin"]), (req, res, next) => {
    service.updateOne({
        providerId: Number(req.params.id),
        ...req.body
    })
        .then((data) => {
            if (data === null) {
                throw new NotFoundError(`Could not find availability with id ${req.params.id}`);
            }
            res.status(200).json(data);
        })
        .catch((err) => next(err));
});

module.exports = controller;
