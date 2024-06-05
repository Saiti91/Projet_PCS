const Joi = require("joi");

// Schéma pour la création d'un service
const createServicesSchema = Joi.object({
    name: Joi.string().required(), // Nom du service
    type: Joi.string().required(), // Type de service
    price: Joi.number().positive().required(), // Prix du service (doit être un nombre positif)
    provider: Joi.string().required(), // Fournisseur du service
    address: Joi.string().required(), // Adresse du service
});

// Schéma pour la création d'un type de service
const createServicesTypeSchema = Joi.object({
    name: Joi.string().required(), // Nom du type de service
    type: Joi.string().required(), // Type de service
    apartmentFeature: Joi.string().optional().allow(null), // Feature optionnelle d'appartement
});

// Schéma pour la mise à jour d'un service existant
const updateServicesSchema = Joi.object({
    name: Joi.string().optional(), // Nom du service
    price: Joi.number().positive().optional(), // Prix du service (doit être un nombre positif)
    provider: Joi.string().optional(), // Fournisseur du service
    address: Joi.string().optional(), // Adresse du service
}).min(1); // Au moins une des propriétés doit être mise à jour

// Exportation des schémas pour utilisation dans d'autres parties du code
module.exports = {
    createServicesSchema,
    createServicesTypeSchema,
    updateServicesSchema,
};
