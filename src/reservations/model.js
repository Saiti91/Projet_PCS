const Joi = require("joi");

// Définition du schéma pour la création de réservation avec validation des champs requis
const createReservationSchema = Joi.object({
    customer: Joi.number().integer().required(),
    apartment_id: Joi.number().integer().positive().required(),
    date_start: Joi.date().iso().greater("now").required(),
    date_end: Joi.date().iso().greater(Joi.ref("date_start")).required(),
    services: Joi.array().items(Joi.object({
        serviceType_id: Joi.number().integer().required(),
        serviceProvider_id: Joi.number().integer().required()
    })).required(),
    price: Joi.number().required()
});

// Définition du schéma pour la mise à jour de réservation avec validation des champs optionnels
const updateReservationSchema = Joi.object({
    date_start: Joi.date().iso().greater("now").optional(),
    date_end: Joi.date().iso().greater(Joi.ref("date_start")).optional(),
    price: Joi.number().positive().optional(),
}).min(1);

module.exports = {
    createReservationSchema,
    updateReservationSchema,
};
