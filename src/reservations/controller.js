// Importation des modules nécessaires
const { Router } = require("express");
const reservationService = require("./service"); // Service pour les opérations de réservation
const NotFoundError = require("../common/http_errors").NotFoundError; // Gestion d'erreurs pour une ressource introuvable
const authorize = require("../common/middlewares/authorize_middleware"); // Middleware pour l'autorisation

// Création du routeur Express
const controller = Router();

// Route GET pour récupérer toutes les réservations
controller.get(
    "/",
    authorize(["staff", "customer", "owner","provider"]), // Autorisation pour différents rôles
    (_req, res, next) => {
        reservationService.getAll()
            .then((data) => res.json(data)) // Envoie des données en réponse si réussi
            .catch((err) => next(err)); // Passe à la gestion d'erreurs en cas d'échec
    },
);

// Route GET pour récupérer une réservation spécifique par ID
controller.get(
    "/:id",
    authorize(["staff", "customer", "owner","provider"]),
    (req, res, next) => {
        reservationService.getOne(Number(req.params.id))
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

// Route POST pour créer une nouvelle réservation
controller.post("/", (req, res, next) => {
    reservationService.createOne({
        ...req.body, // Prend les données de la requête
        customer: req.auth?.uid, // Associe la réservation à l'utilisateur authentifié
        date_start: new Date(req.body.date_start),
        date_end: new Date(req.body.date_end),
    })
        .then((data) => {
            res.status(201).json(data); // Renvoie la nouvelle réservation avec un statut 201
        })
        .catch((err) => next(err));
});

// Route DELETE pour supprimer une réservation par ID
controller.delete(
    "/:id",
    authorize(["staff", "owner", "customer","provider"]),
    (req, res, next) => {
        reservationService.deleteOne(Number(req.params.id))
            .then((id) => {
                if (id === null) {
                    throw new NotFoundError(
                        `Could not find reservation with id ${req.params.id}`,
                    );
                }
                res.status(204).json(); // Confirme la suppression sans retourner de contenu
            })
            .catch((err) => next(err));
    },
);

// Route PATCH pour mettre à jour une réservation spécifique
controller.patch(
    "/:id",
    authorize(["staff", "owner", "customer","provider"]),
    (req, res, next) => {
        reservationService.updateOne(Number(req.params.id), {
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
                res.status(200).json(data); // Renvoie la réservation mise à jour
            })
            .catch((err) => next(err));
    },
);

// Exportation du contrôleur pour l'utiliser dans d'autres parties de l'application
module.exports = controller;
