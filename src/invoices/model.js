const Joi = require("joi");

const createInvoiceSchema = Joi.object({
    userId: Joi.number().integer().positive().optional(),
    providerId: Joi.number().integer().positive().optional(),
    reservationId: Joi.number().integer().positive().optional(),
    amount: Joi.number().positive().required(),
    issuedDate: Joi.date().default(() => new Date(), 'current date'),
    paid: Joi.boolean().default(false)
});

const updateInvoiceSchema = Joi.object({
    userId: Joi.number().integer().positive().optional(),
    providerId: Joi.number().integer().positive().optional(),
    reservationId: Joi.number().integer().positive().optional(),
    amount: Joi.number().positive().optional(),
    issuedDate: Joi.date().optional(),
    paid: Joi.boolean().optional()
}).min(1);

module.exports = {
    createInvoiceSchema,
    updateInvoiceSchema,
};
