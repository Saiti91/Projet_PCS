const {Router} = require("express");
const Service = require("./service");
const {NotFoundError, InternalServerError} = require("../common/http_errors");
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

controller.get(
    "/",
    authorize(["staff", "customer", "owner", "provider", "admin"]),
    (_req, res, next) => {
        Service.getAll()
            .then((data) => res.json(data))
            .catch((err) => next(err));
    },
);

controller.get(
    "/type",
    authorize(["staff", "customer", "owner", "provider", "admin"]),
    (_req, res, next) => {
        Service.getAllType()
            .then((data) => res.json(data))
            .catch((err) => next(err));
    },
);

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

controller.get(
    "/request",
    authorize(["staff", "admin"]),
    (_req, res, next) => {
        Service.getAllRequested()
            .then((data) => res.json(data))
            .catch((err) => next(err));
    },
);

controller.get(
    "/request/:id",
    authorize(["staff", "admin"]),
    (req, res, next) => {
        Service.getOneRequested(Number(req.params.id), {
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

controller.get(
    "/appartements/:appartementId/services",
    authorize(["staff", "customer", "owner", "provider", "admin"]), // Middleware d'autorisation
    async (req, res, next) => {
        try {
            // Récupérer l'ID de l'appartement depuis les paramètres de la requête
            const appartementId = Number(req.params.appartementId);

            // Appeler la fonction de service pour obtenir les services disponibles
            const services = await Service.getServicesWithinRadius(appartementId,process.env.PROVIDER_RANGE_KM);
            console.log("Service avant envoi:",services)
            // Envoyer la réponse en JSON avec les services obtenus
            res.json(services);
        } catch (err) {
            // Gérer les erreurs et envoyer une réponse appropriée
            console.error("Failed to retrieve services:", err);

            // Vérifier le type d'erreur et envoyer la réponse appropriée
            if (err instanceof NotFoundError) {
                return next(err);
            }
            next(new InternalServerError("An error occurred while retrieving services"));
        }
    }
);

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

controller.post(
    "/request",
    authorize(["customer"]),
    (req, res, next) => {
        Service.createRequestOne(req.body)
            .then((data) => {
                res.status(201).json(data);
            })
            .catch((err) => next(err));
    },
);

controller.post(
    '/provider/:provider_id/service',
    authorize(["staff", "admin"]),
    async (req, res, next) => {
        try {
            const {provider_id, serviceType_id, price} = req.body;
            console.log('Request received for adding service to provider:', {provider_id, serviceType_id, price});

            const result = await Service.addServiceToProvider(provider_id, serviceType_id, price);

            console.log('Service added to provider successfully:', result);
            res.status(201).json(result);
        } catch (err) {
            console.error('Error adding service to provider:', err);
            if (err.code === '23505') {
                res.status(409).json({error: 'Duplicate service for provider'});
            } else if (err.message.includes('Validation error')) {
                res.status(400).json({error: err.message});
            } else if (err.message.includes('Provider not found')) {
                res.status(404).json({error: err.message});
            } else {
                res.status(500).json({error: 'An error occurred while adding the service to the provider'});
            }
            next(err);
        }
    }
);

controller.post(
    "/type",
    authorize(["staff", "admin"]),
    (req, res, next) => {
        Service.createType(req.body)
            .then((data) => {
                res.status(201).json(data);
            })
            .catch((err) => next(err));
    },
);

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

controller.delete(
    "/request/:id",
    authorize(["admin", "staff"]),
    (req, res, next) => {
        Service.deleteRequestOne(Number(req.params.id), {
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
