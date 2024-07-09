const Joi = require("joi");

const createApartmentAvailabilitySchema = Joi.object({
    apartment_id: Joi.number().integer().positive().required(),
});

const updateApartmentAvailabilitySchema = Joi.object({
    dates: Joi.array().items(Joi.object({
        date: Joi.date().required(),
        available: Joi.string().required() // Changed to 'status' to match the repository function
    })).required(),
    apartment_id: Joi.number().integer().positive().required()
});

module.exports = {
    createApartmentAvailabilitySchema,
    updateApartmentAvailabilitySchema,
};
