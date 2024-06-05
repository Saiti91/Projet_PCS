const {createServicesSchema, updateServicesSchema, createServicesTypeSchema} = require("./model");
const Repository = require("./repository");
const {calculateDistance} = require("../common/middlewares/distanceCalculation_middleware");
const {InvalidArgumentError, UnauthorizedError} = require("../common/service_errors");
const {getGeoCoordinates} = require("../common/middlewares/gps_middleware");

async function createOne(serviceData) {
    // Valider le service avec un schéma Joi ou similaire
    const {value, error} = createServicesSchema.validate(serviceData);
    if (error) {
        throw error;
    }
    // Vérifier l'unicité du nom du service
    const existingService = await Repository.getOneBy("name", value.name);
    if (existingService) {
        throw new InvalidArgumentError("This service name is already taken.");
    }
    // Obtenir les coordonnées géographiques de l'adresse
    const coordinates = await getGeoCoordinates(value.address);
    if (!coordinates) {
        throw new Error("Failed to geocode address.");
    }
    // Ajouter les coordonnées au service
    value.latitude = coordinates.latitude;
    value.longitude = coordinates.longitude;
    // Créer le service dans la base de données
    return await Repository.createOne(value);
}

async function createType(serviceData, apartmentFeature = null) {
    // Valider le type de service avec un schéma Joi ou similaire
    const {value, error} = createServicesTypeSchema.validate(serviceData);
    if (error) {
        throw error;
    }
    // Vérifier l'unicité du nom du type de service
    const existingServiceType = await Repository.getOneBy("name", value.name);
    if (existingServiceType) {
        throw new InvalidArgumentError("This service type name is already taken.");
    }
    // Créer le type de service dans la base de données
    return await Repository.createType(value, apartmentFeature);
}

// Fonction de récupération d'un service en fonction de son ID
async function getOne(id, issuer) {
    if (["provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only see your own service.");
    }

    const service = await Repository.getOne(id);
    if (service) {
        return {...service};
    } else return service;
}

async function getServicesWithinRadius(lat, lon, maxDistance) {
    try {
        // Récupérer tous les services. Cette méthode peut être optimisée avec des queries géospatiales si supportées.
        const services = await Repository.getAll();
        const filteredServices = services.filter(service => {
            // Calculer la distance entre le point donné et chaque service
            const distance = calculateDistance(lat, lon, service.latitude, service.longitude);
            return distance <= maxDistance;
        });

        // Trier les services filtrés par type et sélectionner le plus petit ID pour chaque type
        const sortedServices = {};
        filteredServices.forEach(service => {
            const type = service.type;
            if (!sortedServices[type] || service.id < sortedServices[type].id) {
                sortedServices[type] = service;
            }
        });

        return Object.values(sortedServices);
    } catch (error) {
        console.error("Error processing services within radius:", error);
        throw new Error("Failed to process services within radius");
    }
}

async function getAll() {
    const services = await Repository.getAll();
    return services.map((service) => ({...service}));
}

async function getAppartementById(id) {
    const appartement = await Repository.getAppartementById(id);
    return {...appartement};
}

// Fonction de mise à jour d'un service en fonction de son ID
async function updateOne(id, service, issuer) {
    if (["customer", "owner", "provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You cannot update services.");
    }

    const {value, error} = updateServicesSchema.validate(service);
    if (error) {
        throw error;
    }

    const newService = await Repository.updateOne(id, value);

    if (newService) {
        return {...newService};
    }

    return newService;
}

// Fonction de suppression d'un service par son ID
async function deleteOne(id, issuer) {
    if (["customer", "owner", "provider"].includes(issuer.role)) {
        throw new UnauthorizedError("You cannot delete a service.");
    }

    return await Repository.deleteOne(id);
}

module.exports = {
    createOne,
    createType,
    getOne,
    getAll,
    getServicesWithinRadius,
    getAppartementById,
    updateOne,
    deleteOne
};
