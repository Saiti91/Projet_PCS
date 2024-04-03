const Joi = require("joi");

const createReservationSchema = Joi.object({
    customer: Joi.number().integer().required(),
    location: Joi.number().integer().positive().required(),
    date_start: Joi.date().iso().greater("now").required(),
    date_end: Joi.date().iso().greater(Joi.ref("date_start")).required(),
});

const updateReservationSchema = Joi.object({
    date_start: Joi.date().iso().greater("now").optional(),
    date_end: Joi.date().iso().greater(Joi.ref("date_start")).optional(),
    price: Joi.number().positive().optional(),
}).min(1);

module.exports = {
    createReservationSchema,
    updateReservationSchema,
};
