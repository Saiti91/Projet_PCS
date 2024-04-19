// Importation du routeur d'Express
const { Router } = require("express");
// Importation du service d'authentification qui gère la logique métier spécifique à l'authentification
const authService = require("./service");

// Création d'une nouvelle instance de Router pour gérer les routes liées à l'authentification
const controller = Router();

// Route POST pour la connexion des utilisateurs
controller.post("/login", (req, res, next) => {
    // Appel de la fonction de connexion du service d'authentification avec les données envoyées par l'utilisateur
    authService
        .login(req.body)
        .then((token) => {
            // En cas de succès, envoie du token JWT au client
            res.send({
                token: token,
            });
        })
        .catch((err) => {
            // En cas d'erreur, passe l'erreur au middleware de gestion des erreurs d'Express
            next(err);
        });
});

// Route POST pour l'enregistrement des utilisateurs
controller.post("/register", (req, res, next) => {
    // Appel de la fonction d'enregistrement du service d'authentification avec les données de l'utilisateur
    authService
        .register(req.body) // Supposition que `req.body` est dans le format correct pour un utilisateur
        .then((data) => {
            // En cas de succès, envoie des données de l'utilisateur enregistré au client
            res.json(data);
        })
        .catch((err) => {
            // En cas d'erreur, passe l'erreur au middleware de gestion des erreurs d'Express
            next(err);
        });
});

// Exportation du contrôleur pour utilisation dans d'autres parties de l'application
module.exports = controller;
