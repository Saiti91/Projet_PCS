const Joi = require("joi");

const createInventorySchema = Joi.object({
    reservationId: Joi.number().integer().positive().required(),
    description: Joi.string().required(),
    photos: Joi.array().items(Joi.string()).required()
});

const confirmArrivalSchema = Joi.object({
    inspectionId: Joi.number().integer().positive().required(),
    comments: Joi.string().required(),
    photos: Joi.array().items(Joi.string()).required()
});

const createExitInspectionSchema = Joi.object({
    reservationId: Joi.number().integer().positive().required(),
    comments: Joi.string().required(),
    photos: Joi.array().items(Joi.string()).required()
});

module.exports = {
    createInventorySchema,
    confirmArrivalSchema,
    createExitInspectionSchema,
};
