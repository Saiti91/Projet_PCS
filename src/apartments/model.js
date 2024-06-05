// Importation de la bibliothèque Joi pour la validation des schémas
const Joi = require("joi");

// Schéma pour la création d'un emplacement
const createApartmentSchema = Joi.object({
    ownerEmail: Joi.string().required(), // ID du propriétaire, doit être un entier positif
    owner_id: Joi.number().integer().positive().optional(),
    surface: Joi.number().integer().positive().required(), // Superficie de l'emplacement, en m², doit être un entier positif
    address: Joi.string().required(), // Adresse de l'emplacement, doit être une chaîne de caractères non vide
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    capacity: Joi.number().integer().positive().required(),// Capacité d'accueil de l'emplacement, en nombre de personnes, doit être un entier positif
    apartmentsType: Joi.string().required(), // Type de l'emplacement, doit être une chaîne de caractères non vide
    garden: Joi.bool().required(), // Jardin de l'emplacement, doit être un booléen
    roomNumber: Joi.number().integer().positive().required(), // Nombre de pièces de l'emplacement, doit être un entier positif
    pool: Joi.bool().required(), // Piscine de l'emplacement, doit être un booléen
    price: Joi.number().positive().required(), // Prix de location de l'emplacement, doit être un nombre positif
    available: Joi.bool().required(), // Disponibilité de l'emplacement, doit être un booléen
    imagePaths: Joi.array().items(Joi.string()).optional()
});


// Schéma pour la mise à jour d'un emplacement existant
const updateApartmentSchema = Joi.object({
    ownerEmail: Joi.string().optional(), // ID du propriétaire, optionnel
    owner_id: Joi.number().integer().positive().optional(),
    surface: Joi.number().integer().positive().optional(), // Superficie de l'emplacement, optionnelle
    address: Joi.string().optional(), // Adresse de l'emplacement, optionnelle
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    capacity: Joi.number().integer().positive().optional(), // Capacité d'accueil, optionnelle
    type: Joi.string().optional(), // Type de l'emplacement, doit être une chaîne de caractères non vide
    garden: Joi.bool().optional(), // Jardin de l'emplacement, doit être un booléen
    roomNumber: Joi.number().integer().positive().optional(), // Nombre de pièces de l'emplacement, doit être un entier positif
    pool: Joi.bool().optional(), // Piscine de l'emplacement, doit être un booléen
    price: Joi.number().positive().optional(), // Prix de location, optionnel
    available: Joi.bool().optional(), // Disponibilité, optionnelle
    imagePaths: Joi.array().items(Joi.string()).optional()
}).min(1); // Au moins une des propriétés doit être mise à jour

// Exportation des schémas pour utilisation dans d'autres parties du code
module.exports = {
    createLocationSchema: createApartmentSchema,
    updateLocationSchema: updateApartmentSchema,
};
