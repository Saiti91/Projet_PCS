const Joi = require("joi");

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(), // Make sure this matches your original intent, noticing the typo 'pasword' in TypeScript code.
});

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
});

module.exports = {
    loginSchema,
    registerSchema,
};
