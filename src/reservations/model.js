// Importation de la bibliothèque Joi pour la validation de données
const Joi = require("joi");

// Définition du schéma pour la création de réservation avec validation des champs requis
const createReservationSchema = Joi.object({
    // Le champ 'customer' doit être un nombre entier et est obligatoire
    customer: Joi.number().integer().required(),
    // Le champ 'location' doit être un nombre entier positif et est obligatoire
    location: Joi.number().integer().positive().required(),
    // Le champ 'date_start' doit être une date au format ISO et ne peut pas être antérieure à la date actuelle
    date_start: Joi.date().iso().greater("now").required(),
    // Le champ 'date_end' doit être une date au format ISO, après 'date_start', et est obligatoire
    date_end: Joi.date().iso().greater(Joi.ref("date_start")).required(),
});

// Définition du schéma pour la mise à jour de réservation avec validation des champs optionnels
const updateReservationSchema = Joi.object({
    // Le champ 'date_start' peut être une date au format ISO, après la date actuelle, et est optionnel
    date_start: Joi.date().iso().greater("now").optional(),
    // Le champ 'date_end' peut être une date au format ISO, après 'date_start', et est optionnel
    date_end: Joi.date().iso().greater(Joi.ref("date_start")).optional(),
    // Le champ 'price' peut être un nombre positif et est optionnel
    price: Joi.number().positive().optional(),
}).min(1);  // Au moins une des propriétés optionnelles doit être fournie lors de la mise à jour

// Exportation des schémas pour leur utilisation dans d'autres parties du projet
module.exports = {
    createReservationSchema,
    updateReservationSchema,
};
