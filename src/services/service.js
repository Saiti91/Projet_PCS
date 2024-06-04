const {createServicesSchema, updateServicesSchema, createServicesTypeSchema} = require("./model");
const Repository = require("./repository");
const {calculateDistance} = require("./locationService");
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

async function createOnetype(serviceData) {
    // Valider le service avec un schéma Joi ou similaire
    const {value, error} = createServicesTypeSchema.validate(serviceData);
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


// fonction de récupération d'un service en fonction d'un id
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
    const services = await Repository.getAppartementById(id);
    return services.map((service) => ({...service/*, password: "[redacted]" */}));
}

// fonction de changement d'information sur un utilisateur en fonction de son ID
async function updateOne(id, service, issuer) {
    if (["customer", "owner", "provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You cannot update services.");
    }

    if (["customer", "owner", "provider"].includes(issuer.role) && service.role) {
        throw new UnauthorizedError("You cannot update services.");
    }

    // if (issuer.role === "staff" && service.role === "admin") {
    //     throw new UnauthorizedError("Only admins can create admins.");
    // }

    const {value, error} = updateServicesSchema.validate(service);
    if (error) {
        throw error;
    }

    const newService = await Repository.updateOne(id, value);

    if (newService) {
        return {...newService/*, password: "[redacted]"*/};
    }

    return newService;
}

// Suppression d'un utilisateur
async function deleteOne(id, issuer) {

    if (["customer", "owner", "provider"].includes(issuer.role)) {
        throw new UnauthorizedError("You cannot delete a service.");
    }

    return await Repository.deleteOne(id);
}

module.exports = {
    createOne, getOne, getAll, getServicesWithinRadius,
    getAppartementById, updateOne, deleteOne, createOnetype
};
