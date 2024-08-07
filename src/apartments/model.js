//apartments/model.js
const Joi = require("joi");

// Schéma pour la création d'un emplacement avec adresse
const createApartmentSchema = Joi.object({
    ownerEmail: Joi.string().email().required(),
    surface: Joi.number().integer().positive().required(),
    capacity: Joi.number().integer().positive().required(),
    apartmentsType: Joi.string().required(),
    apartmentsType_id: Joi.number().integer().optional(),
    numberOfRoom: Joi.number().integer().positive().required(),
    price: Joi.number().positive().required(),
    address: Joi.object({
        longitude: Joi.number().allow(null).optional(),
        latitude: Joi.number().allow(null).optional(),
        number: Joi.number().integer().required(),
        addressComplement: Joi.string().valid('bis', 'ter').allow(null).optional(),
        building: Joi.string().allow(null, '').optional(),
        apartmentNumber: Joi.number().integer().allow(null).optional(),
        street: Joi.string().required(),
        CP: Joi.number().integer().required(),
        town: Joi.string().required()
    }).required(),
    imagePaths: Joi.array().items(Joi.string()).allow(null).optional()
});

// Schéma pour la mise à jour d'un emplacement avec adresse
const updateApartmentSchema = Joi.object({
    ownerEmail: Joi.string().optional(),
    surface: Joi.number().integer().positive().optional(),
    capacity: Joi.number().integer().positive().optional(),
    apartmentsType: Joi.string().optional(),
    numberOfRoom: Joi.number().integer().positive().optional(),
    price: Joi.number().positive().optional(),
    address: Joi.object({
        longitude: Joi.number().allow(null).optional(),
        latitude: Joi.number().allow(null).optional(),
        number: Joi.number().integer().optional(),
        addressComplement: Joi.string().valid('bis', 'ter').allow(null, '').optional(),
        building: Joi.string().allow(null, '').optional(),
        apartmentNumber: Joi.number().integer().allow(null).optional(),
        street: Joi.string().optional(),
        CP: Joi.number().integer().optional(),
        town: Joi.string().optional()
    }).optional(),
    imagePaths: Joi.array().items(Joi.string()).allow(null).optional()
}).min(1);

const checkAvailableSchema = Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().required(),
    apartment_id: Joi.number().integer().positive().required()
});

module.exports = {
    createApartmentSchema,
    updateApartmentSchema,
    checkAvailableSchema
};
