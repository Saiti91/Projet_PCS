// Importations nécessaires pour configurer le routeur
const { Router } = require("express");
const Service = require("./service"); // Le service contenant la logique métier
const NotFoundError = require("../common/http_errors").NotFoundError; // Classe d'erreur pour les ressources introuvables
const authorize = require("../common/middlewares/authorize_middleware"); // Middleware pour gérer l'autorisation
const ForbiddenError = require("../common/http_errors").ForbiddenError; // Ajouter cette classe si elle n'est pas déjà définie

const controller = Router();

// Route pour récupérer tous les emplacements
controller.get("/", async (req, res, next) => {
    try {
        const data = await Service.getAll();
        res.json(data); // Envoie les données récupérées au client
    } catch (err) {
        next(err); // Passe l'erreur au gestionnaire d'erreur suivant
    }
});

// Route pour récupérer un emplacement spécifique par son ID
controller.get("/:id", async (req, res, next) => {
    try {
        const data = await Service.getOne(Number(req.params.id));
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// Route pour créer un nouvel emplacement
controller.post("/", async (req, res, next) => {
    try {
        const user = req.user; // Supposons que 'user' est ajouté à la requête par un middleware d'authentification
        if (!user || !user.roles.includes("staff")) {
            throw new ForbiddenError("You are not authorized to perform this action");
        }

        const data = await Service.createOne(req.body);
        res.status(201).json(data); // Renvoie le nouvel emplacement avec un statut 201
    } catch (err) {
        next(err);
    }
});

// Route pour supprimer un emplacement par son ID
controller.delete("/:id", authorize(["staff", "owner"]), async (req, res, next) => {
    try {
        const id = await Service.deleteOne(Number(req.params.id));
        if (id === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(204).json(); // Confirme la suppression sans envoyer de contenu
    } catch (err) {
        next(err);
    }
});

// Route pour mettre à jour un emplacement par son ID
controller.patch("/:id", authorize(["staff", "owner"]), async (req, res, next) => {
    try {
        const data = await Service.updateOne(Number(req.params.id), req.body);
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(200).json(data); // Renvoie l'emplacemen mis à jour
    } catch (err) {
        next(err);
    }
});

// Exportation du contrôleur pour utilisation dans d'autres parties de l'application
module.exports = controller;
