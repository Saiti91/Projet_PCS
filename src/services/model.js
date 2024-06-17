// services/model.js
const Joi = require("joi");

// Schéma pour la création d'un service
const createServicesSchema = Joi.object({
    providerEmail: Joi.string().email().required(),
    name: Joi.string().required(),
    type: Joi.string().required(),
    price: Joi.number().positive().required(),
    provider: Joi.string().required(),
    address: Joi.string().required(),
});

// Schéma pour la création d'un type de service
const createServicesTypeSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    apartmentFeature: Joi.string().optional().allow(null),
});

// Schéma pour la mise à jour d'un service existant
const updateServicesSchema = Joi.object({
    name: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    provider: Joi.string().optional(),
    address: Joi.string().optional(),
}).min(1); // Au moins une des propriétés doit être mise à jour

// Schéma pour la création d'une entreprise avec ses services
const createProviderSchema = Joi.object({
    name: Joi.string().required(),
    telephone: Joi.string().pattern(/^\+?\d{1,15}$/).required(),
    address: Joi.string().required(),
    services: Joi.array().items(createServicesSchema).min(1).required()
});

// Exportation des schémas pour utilisation dans d'autres parties du code
module.exports = {
    createServicesSchema,
    createServicesTypeSchema,
    updateServicesSchema,
    createProviderSchema
};

