const Joi = require("joi");

const createTicketSchema = Joi.object({
    userId: Joi.number().integer().positive().required(),
    serviceProviderId: Joi.number().integer().positive().optional(),
    subject: Joi.string().required(),
    description: Joi.string().required(),
    priority: Joi.string().valid("low", "medium", "high").required(),
    category: Joi.string().required(),
    status: Joi.string().valid("open", "closed", "in_progress").default("open"),
    assignedTo: Joi.number().integer().positive().optional()
});

const updateTicketSchema = Joi.object({
    subject: Joi.string().optional(),
    description: Joi.string().optional(),
    priority: Joi.string().valid("low", "medium", "high").optional(),
    category: Joi.string().optional(),
    status: Joi.string().valid("open", "closed", "in_progress").optional(),
    assignedTo: Joi.number().integer().positive().optional()
}).min(1);

module.exports = {
    createTicketSchema,
    updateTicketSchema,
};
