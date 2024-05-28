// Importation du module Joi pour la validation de données
const Joi = require("joi");

// Définition du schéma de validation pour le formulaire de connexion
const loginSchema = Joi.object({
    email: Joi.string().email().required(),  // L'email doit être une chaîne valide et respecter le format d'email
    password: Joi.string().required(),       // Le mot de passe est requis et doit être une chaîne
});

// Définition du schéma de validation pour le formulaire d'inscription
const registerSchema = Joi.object({
    email: Joi.string().email().required(),      // L'email doit être valide et est requis
    password: Joi.string().required(),           // Le mot de passe est requis
    first_name: Joi.string().required(),         // Le prénom est requis
    last_name: Joi.string().required(),
    role: Joi.string().required()
});

// Exportation des schémas pour utilisation dans d'autres parties de l'application
module.exports = {
    loginSchema,
    registerSchema,
};
