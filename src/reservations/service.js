// Importation des schémas
const { createReservationSchema, updateReservationSchema } = require("./model");
const Repository = require("./repository");
const locationService = require("../locations/service");
const { InvalidArgumentError } = require("../common/service_errors");

// Fonction asynchrone pour créer une nouvelle réservation
async function createOne(reservation) {
    // Validation de la réservation avec le schéma approprié
    const { value, error } = createReservationSchema.validate(reservation);

    // Lève une exception si une erreur de validation est trouvée
    if (error) {
        throw error;
    }

    // Récupération du lieu de la réservation pour vérifier son existence
    const location = await locationService.getOne(reservation.location);

    // Lève une exception si le lieu spécifié n'existe pas
    if (!location) {
        throw new InvalidArgumentError(
            "The location you're looking to reserve does not exist."
        );
    }

    // Lève une exception si le lieu n'est pas disponible pour la réservation
    if (!value.location) {
        throw new InvalidArgumentError(
            "The location you're looking to reserve is not available for now."
        );
    }

    // Vérifie s'il existe des réservations qui se chevauchent avec les dates demandées
    const overlapping = await Repository.getOverlappingReservations(
        value.date_start,
        value.date_end,
        value.location
    );

    // Lève une exception si un chevauchement est détecté
    if (overlapping.length) {
        throw new InvalidArgumentError(
            "This interval is not available. Please try another."
        );
    }

    // Crée la réservation dans le dépôt et retourne le résultat
    return await Repository.createOne(value);
}

// Fonction asynchrone pour récupérer une réservation par son identifiant
async function getOne(id) {
    return await Repository.getOne(id);
}

// Fonction asynchrone pour récupérer toutes les réservations
async function getAll() {
    return await Repository.getAll();
}

// Fonction asynchrone pour mettre à jour une réservation existante
async function updateOne(id, reservation) {
    // Validation de la réservation mise à jour avec le schéma approprié
    const { value, error } = updateReservationSchema.validate(reservation);

    // Lève une exception si une erreur de validation est trouvée
    if (error) {
        throw error;
    }

    // Vérifie s'il existe des réservations qui se chevauchent avec les dates demandées
    const overlapping = await Repository.getOverlappingReservations(
        value.date_start,
        value.date_end,
        value.location
    );

    // Lève une exception si un chevauchement est détecté
    if (overlapping.length) {
        throw new InvalidArgumentError(
            "This interval is not available. Please try another."
        );
    }

    // Met à jour la réservation dans le dépôt et retourne le résultat
    return await Repository.updateOne(id, value);
}

// Fonction asynchrone pour supprimer une réservation par son identifiant
async function deleteOne(id) {
    return await Repository.deleteOne(id);
}

// Exportation des fonctions pour leur utilisation dans d'autres modules
module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
