// servicesCalendar/service.js
const {createAvailabilitySchema, updateAvailabilitySchema} = require("./model");
const Repository = require("./repository");
const {InvalidArgumentError} = require("../common/service_errors");

// Fonction asynchrone pour créer des disponibilités pour un fournisseur de services
async function createOne(calendar) {
    // Validation de la disponibilité avec le schéma défini
    const {value, error} = createAvailabilitySchema.validate(calendar);
    if (error) {
        throw error;
    }
    // Création de la disponibilité dans la base de données et retour du résultat
    return await Repository.createAvailabilities(value.providerId);
}

// Fonction asynchrone pour récupérer les disponibilités d'un fournisseur de services par son identifiant
async function getOne(id) {
    return await Repository.getById(id);
}

// Fonction asynchrone pour récupérer toutes les disponibilités
async function getAll() {
    return await Repository.getAllAvailabilities();
}

// Fonction asynchrone pour mettre à jour des disponibilités existantes
async function updateOne(schema) {
    // Validation de la disponibilité avec le schéma de mise à jour
    const {value, error} = updateAvailabilitySchema.validate(schema);
    if (error) {
        throw error;
    }

    // Mise à jour de la disponibilité dans la base de données et retour du résultat
    return await Repository.updateAvailabilities(value.providerId, value.availabilities);
}

// Fonction asynchrone pour supprimer des disponibilités par l'identifiant du fournisseur de services
async function deleteOne(id) {
    return await Repository.deleteAvailabilitiesByProviderId(id);
}

// Exportation des fonctions pour utilisation dans d'autres parties de l'application
module.exports = {createOne, getOne, getAll, updateOne, deleteOne};
