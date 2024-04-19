const Joi = require("joi");

//Schema qui crée un objet afin de manipuler facilement les schemas récuperer par la requète en fonction
// de la méthode qu'on souhaite
const createUserSchema = Joi.object({
    role: Joi.string()
        .valid("admin", "customer", "owner", "staff")
        .default("customer"),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
});

const updateUserSchema = Joi.object({
    role: Joi.string().valid("admin", "customer", "owner", "staff").optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
}).min(1);

module.exports = {
    createUserSchema,
    updateUserSchema,
};
