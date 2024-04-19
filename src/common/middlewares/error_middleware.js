// Importation des classes d'erreur personnalisées et de la bibliothèque Joi
const { UnauthorizedError } = require("../service_errors");
const { HTTPError } = require("../http_errors");
const { ValidationError } = require("joi");
const { InvalidArgumentError, AuthError } = require("../service_errors");
const { UnauthorizedError: JWTUnauthorizedError } = require("express-jwt");

// Définition du middleware de gestion des erreurs
function errorHandlingMiddleware(err, _req, res, next) {
    // Vérification si l'objet erreur est null ou undefined, passer au middleware suivant
    if (!err) {
        next();
    }

    // Gestion des erreurs HTTP personnalisées
    if (err instanceof HTTPError) {
        res.status(err.status).json({
            message: err.message,
        });
    }
    // Gestion des erreurs de validation de Joi
    else if (err instanceof ValidationError) {
        res.status(400).json({
            message: err.message,
        });
    }
    // Gestion des erreurs d'argument invalide
    else if (err instanceof InvalidArgumentError) {
        res.status(400).json({
            message: err.message,
        });
    }
    // Gestion des erreurs de syntaxe, souvent liées au parsing JSON
    else if (err instanceof SyntaxError) {
        res.status(400).json({
            message: err.message,
        });
    }
    // Gestion des erreurs d'authentification
    else if (err instanceof AuthError) {
        res.status(401).json({
            message: err.message,
        });
    }
    // Gestion des erreurs d'autorisation, incluant les erreurs JWT
    else if (
        err instanceof UnauthorizedError ||
        err instanceof JWTUnauthorizedError
    ) {
        res.status(403).json({
            message: err.message,
        });
    }
    // Gestion de toutes les autres erreurs non spécifiées
    else {
        res.status(500).json({
            message: "Something went wrong. Please try again later.",
        });

        // Log des erreurs non gérées pour le débogage
        console.error(err);
    }
}

// Exportation du middleware pour utilisation dans l'application Express
module.exports = errorHandlingMiddleware;
