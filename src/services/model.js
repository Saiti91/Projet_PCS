// services/model.js
const Joi = require("joi");

// Schéma pour la création d'un service
const createServicesSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.object({
        number: Joi.number().required(),
        street: Joi.string().required(),
        CP: Joi.number().required(),
        town: Joi.string().required(),
    }).required(),
    phone: Joi.string().required(),
    services: Joi.array().items(Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
    })).min(1).required()
});

const createServicesTypeSchema = Joi.object({
    name: Joi.string().required(),
    features: Joi.array().items(Joi.string()).required()
});
const addServiceToProviderSchema = Joi.object({
    provider_id: Joi.number().integer().required(),
    serviceType_id: Joi.number().integer().required(),
    price: Joi.number().positive().required()
});

// Schéma pour la mise à jour d'un service existant
const updateServicesSchema = Joi.object({
    name: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    provider: Joi.string().optional(),
    address: Joi.string().optional(),
}).min(1); // Au moins une des propriétés doit être mise à jour


// Exportation des schémas pour utilisation dans d'autres parties du code
module.exports = {
    createServicesSchema,
    createServicesTypeSchema,
    updateServicesSchema,
    addServiceToProviderSchema
};

