const { Router } = require("express");
const Service = require("./service");
const NotFoundError = require("../common/http_errors").NotFoundError;
const authorize = require("../common/middlewares/authorize_middleware");

const controller = Router();

// Récupérer tous les emplacements
controller.get("/", async (req, res, next) => {
    try {
        const data = await Service.getAll();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// Récupérer un emplacement par son ID
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

// Créer un nouvel emplacement
controller.post("/", async (req, res, next) => {
    try {
        // Vérifiez l'autorisation ici
        const user = req.user; // Supposons que vous ayez un middleware qui ajoute l'utilisateur à la requête
        if (!user || !user.roles.includes("staff")) {
            throw new ForbiddenError("You are not authorized to perform this action");
        }

        const data = await Service.createOne(req.body);
        res.status(201).json(data);
    } catch (err) {
        next(err);
    }
});


// Supprimer un emplacement par son ID
controller.delete("/:id", authorize(["staff", "owner"]), async (req, res, next) => {
    try {
        const id = await Service.deleteOne(Number(req.params.id));
        if (id === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(204).json();
    } catch (err) {
        next(err);
    }
});

// Mettre à jour un emplacement par son ID
controller.patch("/:id", authorize(["staff", "owner"]), async (req, res, next) => {
    try {
        const data = await Service.updateOne(Number(req.params.id), req.body);
        if (data === null) {
            throw new NotFoundError(`Could not find location with id ${req.params.id}`);
        }
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = controller;
