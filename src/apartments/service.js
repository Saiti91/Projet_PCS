const { createApartmentSchema } = require("./model");
const Repository = require("./repository");
const UserRepository = require("../users/repository");
const { InvalidArgumentError } = require("../common/service_errors");
const { getGeoCoordinates } = require("../common/middlewares/gps_middleware");
const fs = require('fs');
const path = require('path');

async function createOne(location, files) {
    // Clean up empty values for addressComplement and building
    if (location.address.addressComplement === '') {
        location.address.addressComplement = null;
    }
    if (location.address.building === '') {
        location.address.building = null;
    }
    console.log(location.address);
    // Validate address completeness before geocoding
    if (!location.address.street || !location.address.town || !location.address.CP) {
        console.error("Incomplete address information for geocoding in service:", location.address.street, location.address.town, location.address.CP);
        throw new Error("Incomplete address information for geocoding.");
    }

    // Obtain geo-coordinates
    try {
        const coordinates = await getGeoCoordinates(location.address);
        location.address.latitude = coordinates.latitude;
        location.address.longitude = coordinates.longitude;
    } catch (error) {
        throw new Error("Failed to obtain geo-coordinates. Please ensure the address is complete and correct.");
    }

    // Validate location data
    const { value, error } = createApartmentSchema.validate(location, { allowUnknown: true });
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid location data!");
    }

    // Retrieve the owner to check existence
    const owner = await UserRepository.getOneBy("email", location.ownerEmail);
    if (!owner) {
        throw new InvalidArgumentError("Provided owner does not have an account!");
    }

    // Update user's role if necessary
    if (owner.role === "customer") {
        await UserRepository.updateOne(location.ownerEmail, { role: "owner" });
    }

    // Retrieve apartment type ID
    const apartmentType = await Repository.getApartmentTypeIdByName(location.apartmentsType);
    if (!apartmentType) {
        throw new InvalidArgumentError("Invalid apartment type!");
    }
    location.apartmentsType_id = apartmentType;
    delete location.apartmentsType;

    // Create location in database
    try {
        const apartment = await Repository.createOne(location);
        const apartmentId = apartment.apartments_id;

        // Create directory for apartment images
        const apartmentDir = path.join(__dirname, `../src/assets/housing/${apartmentId}`);
        if (!fs.existsSync(apartmentDir)) {
            fs.mkdirSync(apartmentDir, { recursive: true });
        }

        // Move files to apartment directory
        const imagePaths = files.map((file, index) => {
            const newFilePath = path.join(apartmentDir, `${index + 1}${path.extname(file.originalname)}`);
            fs.renameSync(file.path, newFilePath);
            return `/src/assets/housing/${apartmentId}/${index + 1}${path.extname(file.originalname)}`;
        });

        // Save image paths to database
        await Repository.saveImagePaths(apartmentId, imagePaths);

        return await Repository.createCalendarForApartment(apartmentId);
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

// Fonction asynchrone pour récupérer 10 emplacements
async function getApartmentImageById(id) {
    try {
        return await Repository.getApartmentImages(id);
    } catch (error) {
        console.error("Failed to retrieve apartment images:", error);
        throw new Error("Failed to retrieve apartment images.");
    }
}

// Fonction asynchrone pour mettre à jour un emplacement existant
async function updateOne(id, location) {
    // Validation de l'emplacement avec le schéma de mise à jour
    const {value, error} = updateApartmentSchema.validate(location);
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
module.exports = {createOne, getOne, getAll, updateOne, deleteOne, getCarousel, getApartmentImageById};
