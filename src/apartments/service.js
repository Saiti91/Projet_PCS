// apartments/service.js
const {createApartmentSchema, updateApartmentSchema} = require("./model");
const Repository = require("./repository");
const UserRepository = require("../users/repository");
const {InvalidArgumentError} = require("../common/service_errors");
const {getGeoCoordinates} = require("../common/middlewares/gps_middleware");
const db = require("../common/db_handler");
const path = require('path');
const fs = require('fs');

async function createOne(location, files) {
    const addressKeys = ['longitude', 'latitude', 'building', 'apartmentNumber', 'addressComplement'];
    addressKeys.forEach(key => {
        if (location.address[key] === '') {
            location.address[key] = null;
        }
    });

    if (!location || !location.address) {
        throw new Error("Location or address is not defined.");
    }

    const {error} = createApartmentSchema.validate(location, {allowUnknown: true});
    if (error) {
        throw new InvalidArgumentError("Invalid location data!");
    }

    const owner = await UserRepository.getOneBy("email", location.ownerEmail);
    if (!owner) {
        throw new InvalidArgumentError("Provided owner does not have an account!");
    }

    if (owner.role === "customer") {
        await UserRepository.updateOne(location.ownerEmail, {role: "owner"});
    }

    const apartmentType = await Repository.getApartmentTypeIdByName(location.apartmentsType);
    if (!apartmentType) {
        throw new InvalidArgumentError("Invalid apartment type!");
    }
    location.apartmentsType_id = apartmentType;
    delete location.apartmentsType;

    try {
        const coordinates = await getGeoCoordinates(location.address);
        location.address.latitude = coordinates.latitude;
        location.address.longitude = coordinates.longitude;
    } catch (error) {
        throw new InvalidArgumentError("Failed to obtain geo-coordinates. Please ensure the address is complete and correct.");
    }

    let apartmentId;
    let apartmentDir;
    try {
        await db.tx(async t => {
            const apartment = await Repository.createOne(location, t);
            apartmentId = apartment.apartments_id;

            apartmentDir = path.join(__dirname, `../assets/housing/${apartmentId}`);
            if (!fs.existsSync(apartmentDir)) {
                fs.mkdirSync(apartmentDir, {recursive: true});
            }

            const imagePaths = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const oldPath = file.path;
                const newPath = path.join(apartmentDir, `${i + 1}${path.extname(file.originalname)}`);
                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, newPath);
                    imagePaths.push(newPath);
                } else {
                    throw new InvalidArgumentError(`File not found: ${oldPath}`);
                }
            }

            await Repository.saveImagePaths(apartmentId, imagePaths, t);

            for (const file of files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }

            await Repository.createCalendarForApartment(apartmentId, t);
        });
    } catch (error) {
        console.error("Error creating location:", error);

        for (const file of files) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        if (apartmentId) {
            await Repository.deleteOne(apartmentId);
            if (apartmentDir && fs.existsSync(apartmentDir)) {
                fs.rmSync(apartmentDir, {recursive: true});
            }
        }

        throw new InvalidArgumentError("Failed to create location.");
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

async function getApartmentsTypes() {
    try {
        return await Repository.getApartmentTypes();
    } catch (error) {
        console.error("Failed to retrieve apartment types:", error);
        throw new Error("Failed to retrieve apartment types.");
    }
}

async function getApartmentFeatures() {
    try {
        return await Repository.getApartmentFeatures();
    } catch (error) {
        console.error("Failed to retrieve apartment features:", error);
        throw new Error("Failed to retrieve apartment features.");
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

module.exports = {
    createOne,
    getOne,
    getAll,
    updateOne,
    deleteOne,
    getCarousel,
    getApartmentImageById,
    getApartmentFeatures,
    getApartmentsTypes
};
