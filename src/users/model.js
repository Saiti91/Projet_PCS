const Joi = require("joi");

// Schéma de validation pour créer une adresse
const addressSchema = Joi.object({
    longitude: Joi.number().required(),
    latitude: Joi.number().required(), // TODO: Ajouter une validation pour les coordonnées GPS
    number: Joi.number().required(),
    addressComplement: Joi.string().valid("bis", "ter").optional(),
    building: Joi.string().optional(),
    apartmentNumber: Joi.number().optional(),
    street: Joi.string().required(),
    CP: Joi.number().required(),
    town: Joi.string().required()
});

// Schéma de validation pour créer un utilisateur classique
const createUserSchema = Joi.object({
    role: Joi.string()
        .valid("admin", "customer", "owner", "staff")
        .default("customer"),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    telephone: Joi.string().pattern(/^\+?\d{1,15}$/).optional(),
    address: addressSchema.optional()
});

// Schéma de validation pour créer un fournisseur de services
const createProviderSchema = Joi.object({
    role: Joi.string().valid("provider").required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    telephone: Joi.string().pattern(/^\+?\d{1,15}$/).required(),
    address: addressSchema.required(),
    type: Joi.array().items(Joi.number()).optional(),
    maxOperatingRadius: Joi.number().optional(),
    price: Joi.number().optional(),
    employee_count: Joi.number().optional()
});

// Schéma de validation pour mettre à jour un utilisateur
const updateUserSchema = Joi.object({
    users_id: Joi.number().integer().required(),
    role: Joi.string().valid("admin", "customer", "owner", "staff", "provider").optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    telephone: Joi.string().pattern(/^\+?\d{1,15}$/).optional(),
    serviceprovider_id: Joi.number().integer().optional()
}).min(1);

module.exports = {
    createUserSchema,
    createProviderSchema,
    updateUserSchema,
};
