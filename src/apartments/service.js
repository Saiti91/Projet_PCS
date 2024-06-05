// Importation des schémas de validation et des référentiels nécessaires
const {createLocationSchema, updateLocationSchema} = require("./model");
const Repository = require("./repository");
const UserRepository = require("../users/repository");
const {InvalidArgumentError} = require("../common/service_errors");
const {getGeoCoordinates} = require("../common/middlewares/gps_middleware");

async function createOne(location) {
    // Validation de l'emplacement avec le schéma défini
    const {value, error} = createLocationSchema.validate(location);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid location data!");
    }

    // Récupération de l'utilisateur propriétaire pour vérifier son existence
    const owner = await UserRepository.getOneBy("email", location.ownerEmail);
    if (!owner) {
        throw new InvalidArgumentError("Provided owner does not have an account!");
    }

    // Mise à jour du rôle de l'utilisateur si nécessaire
    if (owner.role === "customer") {
        await UserRepository.updateOne(location.ownerEmail, {role: "owner"});
    }

    // Obtention des coordonnées géographiques
    try {
        const coordinates = await getGeoCoordinates(location.address);
        value.latitude = coordinates.latitude;
        value.longitude = coordinates.longitude;
    } catch (error) {
        console.error("Error obtaining coordinates:", error);
        throw new Error("Failed to obtain geo-coordinates.");
    }

    // Création de l'emplacement dans la base de données et retour du résultat
    try {
        return await Repository.createOne(value);
    } catch (error) {
        console.error("Error creating location:", error);
        throw new Error("Failed to create location.");
    }
}

// Fonction asynchrone pour récupérer un emplacement par son identifiant
async function getOne(id) {
    try {
        return await Repository.getOne(id);
    } catch (error) {
        console.error(`Failed to retrieve location with ID ${id}:`, error);
        throw new Error(`Failed to retrieve location with ID ${id}.`);
    }
}

// Fonction asynchrone pour récupérer tous les emplacements
async function getAll() {
    try {
        return await Repository.getAll();
    } catch (error) {
        console.error("Failed to retrieve locations:", error);
        throw new Error("Failed to retrieve locations.");
    }
}

// Fonction asynchrone pour récupérer 10 emplacements
async function getCarousel() {
    try {
        return await Repository.getCarousel();
    } catch (error) {
        console.error("Failed to retrieve carousel locations:", error);
        throw new Error("Failed to retrieve carousel locations.");
    }
}

// Fonction asynchrone pour mettre à jour un emplacement existant
async function updateOne(id, location) {
    // Validation de l'emplacement avec le schéma de mise à jour
    const {value, error} = updateLocationSchema.validate(location);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid location data!");
    }

    // Mise à jour de l'emplacement dans la base de données et retour du résultat
    try {
        return await Repository.updateOne(id, value);
    } catch (error) {
        console.error(`Failed to update location with ID ${id}:`, error);
        throw new Error(`Failed to update location with ID ${id}.`);
    }
}

// Fonction asynchrone pour supprimer un emplacement par son identifiant
async function deleteOne(id) {
    try {
        return await Repository.deleteOne(id);
    } catch (error) {
        console.error(`Failed to delete location with ID ${id}:`, error);
        throw new Error(`Failed to delete location with ID ${id}.`);
    }
}

// Exportation des fonctions pour utilisation dans d'autres parties de l'application
module.exports = {createOne, getOne, getAll, updateOne, deleteOne, getCarousel};