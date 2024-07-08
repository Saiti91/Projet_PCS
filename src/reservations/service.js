// Importation des schémas
const {createReservationSchema, updateReservationSchema} = require("./model");
const Repository = require("./repository");
const CalendarRepository = require("../serviceCalendar/repository");
const locationService = require("../apartments/service");
const {InvalidArgumentError} = require("../common/service_errors");

async function createOne(reservation) {
    const { value, error } = createReservationSchema.validate(reservation);
    if (error) {
        throw new InvalidArgumentError(error.details[0].message);
    }

    const location = await locationService.getOne(value.apartment_id);
    if (!location) {
        throw new InvalidArgumentError("The location you're looking to reserve does not exist.");
    }

    const isAvailable = await Repository.checkAvailability(value.date_start, value.date_end, value.apartment_id);
    if (!isAvailable) {
        throw new InvalidArgumentError("Some or all of the dates are not available. Please choose different dates.");
    }

    const overlapping = await Repository.getOverlappingReservations(value.date_start, value.date_end, value.apartment_id);
    if (overlapping.length) {
        throw new InvalidArgumentError("This interval is not available due to existing reservations. Please try another interval.");
    }

    const services = value.services.map(service => ({
        serviceType_id: service.serviceType_id,
        serviceProvider_id: service.serviceProvider_id,
        date_start: value.date_start,
        date_end: value.date_end
    }));

    const reservationWithoutServices = {
        customer: value.customer,
        apartment_id: value.apartment_id,
        date_start: value.date_start,
        date_end: value.date_end,
        price: value.price
    };

    console.log("Valeur Reservations sans services", reservationWithoutServices);
    console.log("Valeur Services", services);

    const newReservation = await Repository.createOne(reservationWithoutServices, services);

    // Mettre à jour les disponibilités des fournisseurs de services
    for (const service of services) {
        const availabilities = [];
        let currentDate = new Date(service.date_start);
        const endDate = new Date(service.date_end);

        while (currentDate <= endDate) {
            availabilities.push({ date: currentDate.toISOString().split('T')[0] });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        await CalendarRepository.updateAvailabilities(service.serviceProvider_id, availabilities);
    }

    return newReservation;
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
    const {value, error} = updateReservationSchema.validate(reservation);
    if (error) {
        throw error;
    }

    // Vérifie s'il existe des réservations qui se chevauchent avec les dates demandées
    const overlapping = await Repository.getOverlappingReservations(value.date_start, value.date_end, value.location);
    if (overlapping.length) {
        throw new InvalidArgumentError("This interval is not available. Please try another.");
    }

    // Met à jour la réservation dans le dépôt et retourne le résultat
    return await Repository.updateOne(id, value);
}

// Fonction asynchrone pour supprimer une réservation par son identifiant
async function deleteOne(id) {
    return await Repository.deleteOne(id);
}

// Exportation des fonctions pour leur utilisation dans d'autres modules
module.exports = {createOne, getOne, getAll, updateOne, deleteOne};
