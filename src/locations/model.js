const Joi = require("joi");

const createLocationSchema = Joi.object({
    owner: Joi.number().integer().positive().required(),
    area: Joi.number().integer().positive().required(),
    address: Joi.string().required(),
    capacity: Joi.number().integer().positive().required(),
    price: Joi.number().positive().required(),
    available: Joi.bool().required(),
});

const updateLocationSchema = Joi.object({
    owner: Joi.number().integer().positive().optional(),
    area: Joi.number().integer().positive().optional(),
    address: Joi.string().optional(),
    capacity: Joi.number().integer().positive().optional(),
    price: Joi.number().positive().optional(),
    available: Joi.bool().optional(),
}).min(1);

module.exports = {
    createLocationSchema,
    updateLocationSchema,
};
