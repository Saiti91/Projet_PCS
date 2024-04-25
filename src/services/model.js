const Joi = require("joi");

//Schema qui crée un objet afin de manipuler facilement les schemas récuperer par la requète en fonction
// de la méthode qu'on souhaite
const createServicesSchema = Joi.object({
    name: Joi.string().required(), // Type de bien
    price: Joi.number().positive().required(), // Prix du service (par utilisation, doit être un nombre positif
    provider: Joi.string().required(),
    available: Joi.bool().required(), // Disponibilité du service, doit être un booléen
    departement: Joi.string().required(),

});

// Schéma pour la mise à jour d'un emplacement existant
const updateServicesSchema = Joi.object({
    name: Joi.string().optional(), // Type de bien
    price: Joi.number().positive().optional(), // Prix du service (par utilisation, doit être un nombre positif
    provider: Joi.string().optional(),
    available: Joi.bool().optional(), // Disponibilité du service, doit être un booléen
    departement: Joi.string().optional(),
}).min(1); // Au moins une des propriétés doit être mise à jour

// Exportation des schémas pour utilisation dans d'autres parties du code
module.exports = {
    createServicesSchema: createServicesSchema,
    updateServicesSchema: updateServicesSchema,
};
