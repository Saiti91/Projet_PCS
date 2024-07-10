const Joi = require('joi');

const createAvailabilitySchema = Joi.object({
    providerId: Joi.number().integer().required(),
});

const updateAvailabilitySchema = Joi.object({
    providerId: Joi.number().integer().required(),
    serviceType_id: Joi.number().integer().required(),
    availabilities: Joi.array().items(
        Joi.object({
            date: Joi.date().required(),
            available: Joi.boolean().required()
        })
    ).required()
});

module.exports = {
    createAvailabilitySchema,
    updateAvailabilitySchema
};