// // Importation de la bibliothèque Joi pour la validation des schémas
// const Joi = require("joi");
// //TODO: Code Calendar model
//
// // Schéma pour la création d'un emplacement
// const createLocationSchema = Joi.object({
//     owner: Joi.number().integer().positive().required(), // ID du propriétaire, doit être un entier positif
//     area: Joi.number().integer().positive().required(), // Superficie de l'emplacement, en m², doit être un entier positif
//     address: Joi.string().required(), // Adresse de l'emplacement, doit être une chaîne de caractères non vide
//     longitude : Joi.number().optional(),
//     latitude : Joi.number().optional(),
//     capacity: Joi.number().integer().positive().required(), // Capacité d'accueil de l'emplacement, en nombre de personnes, doit être un entier positif
//     price: Joi.number().positive().required(), // Prix de location de l'emplacement, doit être un nombre positif
//     available: Joi.bool().required(), // Disponibilité de l'emplacement, doit être un booléen
// });
//
// // Schéma pour la mise à jour d'un emplacement existant
// const updateLocationSchema = Joi.object({
//     owner: Joi.number().integer().positive().optional(), // ID du propriétaire, optionnel
//     area: Joi.number().integer().positive().optional(), // Superficie de l'emplacement, optionnelle
//     address: Joi.string().optional(), // Adresse de l'emplacement, optionnelle
//     longitude : Joi.number().optional(),
//     latitude : Joi.number().optional(),
//     capacity: Joi.number().integer().positive().optional(), // Capacité d'accueil, optionnelle
//     price: Joi.number().positive().optional(), // Prix de location, optionnel
//     available: Joi.bool().optional(), // Disponibilité, optionnelle
// }).min(1); // Au moins une des propriétés doit être mise à jour
//
// // Exportation des schémas pour utilisation dans d'autres parties du code
// module.exports = {
//     createLocationSchema,
//     updateLocationSchema,
// };
