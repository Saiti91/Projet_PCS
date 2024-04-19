// Importation de la bibliothèque Joi pour la validation des données
const Joi = require("joi");

// Définition d'une fonction middleware pour Express qui valide l'ID passé en paramètre
function idParamGuard(req, _res, next) {
    // Création du schéma Joi pour valider que l'ID est un nombre entier positif
    const paramSchema = Joi.string()
        .regex(/^0*[1-9]+[0-9]*$/)  // Expression régulière qui accepte des nombres supérieurs à 0
        .messages({ "string.pattern.base": "Id must be a number superior to 1." })  // Message d'erreur personnalisé
        .required();  // L'ID est requis

    // Validation de l'ID récupéré depuis les paramètres de la requête
    const { error } = paramSchema.validate(req.params.id);

    // Si une erreur est détectée, elle est levée et gérée par le gestionnaire d'erreurs d'Express
    if (error) {
        throw error;
    }

    // Si la validation réussit, passer au middleware suivant
    next();
}

// Exportation de la fonction pour qu'elle puisse être utilisée comme middleware dans d'autres parties de l'application
module.exports = idParamGuard;
