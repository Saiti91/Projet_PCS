// services/controller.js
const { Router } = require("express");
const Service = require("./service");
const NotFoundError = require("../common/http_errors").NotFoundError;
const InternalServerError = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

// Route GET pour récupérer tous les services
controller.get(
    "/",
    authorize(["staff", "customer", "owner", "provider", "admin"]),
    (_req, res, next) => {
        Service.getAll()
            .then((data) => res.json(data))
            .catch((err) => next(err));
    },
);

// Route GET pour récupérer un service spécifique par ID
controller.get(
    "/:id",
    authorize(["staff", "customer", "owner", "provider"]),
    (req, res, next) => {
        Service.getOne(Number(req.params.id), {
            id: req.auth?.uid,
            role: req.auth?.urole,
        })
            .then((data) => {
                if (data === null) {
                    throw new NotFoundError(`Could not find service with id ${req.params.id}`);
                }
                res.json(data);
            })
            .catch((err) => next(err));
    },
);

// Route GET pour récupérer les services disponibles autour d'un appartement
controller.get(
    "/appartements/:appartementId/services",
    authorize(["staff", "customer", "owner", "provider"]),
    async (req, res, next) => {
        try {
            const appartementId = Number(req.params.appartementId);
            const appartement = await Service.getAppartementById(appartementId);
            if (!appartement) {
                return next(new NotFoundError(`Could not find apartment with id ${appartementId}`));
            }

            const maxDistance = Number(process.env.PROVIDER_RANGE_KM || 10); // Default to 10 km if not set
            const { latitude, longitude } = appartement;

            const services = await Service.getServicesWithinRadius(latitude, longitude, maxDistance);
            res.json(services);
        } catch (err) {
            console.error("Failed to retrieve services:", err);
            next(new InternalServerError("An error occurred while retrieving services"));
        }
    }
);

// Route POST pour créer un nouveau service
controller.post(
    "/",
    authorize(["staff", "admin"]),
    (req, res, next) => {
        Service.createOne(req.body)
            .then((data) => {
                res.status(201).json(data);
            })
            .catch((err) => next(err));
    },
);

// Route POST pour créer un nouveau type de service
controller.post(
    "/type",
    authorize(["staff", "admin"]),
    (req, res, next) => {
        const { apartmentFeature, ...typeData } = req.body;
        Service.createType(typeData, apartmentFeature)
            .then((data) => {
                res.status(201).json(data);
            })
            .catch((err) => next(err));
    },
);

// Route POST pour ajouter un service à une entreprise existante
controller.post(
    "/provider/:providerId/service",
    authorize(["staff", "admin"]),
    (req, res, next) => {
        const providerId = Number(req.params.providerId);
        Service.addServiceToProvider(providerId, req.body)
            .then(() => {
                res.status(201).send();
            })
            .catch((err) => next(err));
    },
);

// Route POST pour créer une nouvelle entreprise avec ses services
controller.post(
    "/provider",
    authorize(["staff", "admin"]),
    (req, res, next) => {
        Service.createProviderWithServices(req.body)
            .then((data) => {
                res.status(201).json(data);
            })
            .catch((err) => next(err));
    },
);

// Route DELETE pour supprimer un service par ID
controller.delete(
    "/:id",
    authorize(["owner", "customer", "staff", "provider"]),
    (req, res, next) => {
        Service.deleteOne(Number(req.params.id), {
            id: req.auth?.uid,
            role: req.auth?.urole,
        })
            .then((id) => {
                if (id === null) {
                    throw new NotFoundError(`Could not find service with id ${req.params.id}`);
                }
                res.status(204).send();
            })
            .catch((err) => next(err));
    },
);

// Route PATCH pour mettre à jour un service spécifique par ID
controller.patch(
    "/:id",
    authorize(["owner", "customer", "staff", "provider"]),
    (req, res, next) => {
        Service.updateOne(Number(req.params.id), req.body, {
            id: req.auth?.uid,
            role: req.auth?.urole,
        })
            .then((data) => {
                if (data === null) {
                    throw new NotFoundError(`Could not find service with id ${req.params.id}`);
                }
                res.status(200).json(data);
            })
            .catch((err) => next(err));
    },
);

module.exports = controller;
