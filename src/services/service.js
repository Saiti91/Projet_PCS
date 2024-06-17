// services/service.js
const { createServicesSchema, updateServicesSchema, createServicesTypeSchema, createProviderSchema } = require("./model");
const Repository = require("./repository");
const { calculateDistance } = require("../common/middlewares/distanceCalculation_middleware");
const { InvalidArgumentError, UnauthorizedError } = require("../common/service_errors");
const { getGeoCoordinates } = require("../common/middlewares/gps_middleware");

async function createOne(serviceData) {
    const { value, error } = createServicesSchema.validate(serviceData);
    if (error) {
        throw error;
    }

    const existingService = await Repository.getOneBy("name", value.name);
    if (existingService) {
        throw new InvalidArgumentError("This service name is already taken.");
    }

    const coordinates = await getGeoCoordinates(value.address);
    if (!coordinates) {
        throw new Error("Failed to geocode address.");
    }

    value.latitude = coordinates.latitude;
    value.longitude = coordinates.longitude;

    return await Repository.createOne(value);
}

async function createType(serviceData, apartmentFeature = null) {
    const { value, error } = createServicesTypeSchema.validate(serviceData);
    if (error) {
        throw error;
    }

    const existingServiceType = await Repository.getOneBy("name", value.name);
    if (existingServiceType) {
        throw new InvalidArgumentError("This service type name is already taken.");
    }

    return await Repository.createType(value, apartmentFeature);
}

async function addServiceToProvider(serviceProviderId, serviceData) {
    const { value, error } = createServicesSchema.validate(serviceData);
    if (error) {
        throw error;
    }

    await Repository.addServiceToProvider(serviceProviderId, value);
}

async function createProviderWithServices(providerData) {
    const { value: providerValue, error: providerError } = createProviderSchema.validate(providerData);
    if (providerError) {
        throw providerError;
    }

    const coordinates = await getGeoCoordinates(providerValue.address);
    if (!coordinates) {
        throw new Error("Failed to geocode address.");
    }

    providerValue.latitude = coordinates.latitude;
    providerValue.longitude = coordinates.longitude;

    const services = providerValue.services;
    delete providerValue.services;

    const createdProvider = await Repository.createProviderWithServices(providerValue, services);

    return createdProvider;
}

async function getOne(id, issuer) {
    if (["provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only see your own service.");
    }

    const service = await Repository.getOne(id);
    if (service) {
        return { ...service };
    } else return service;
}

async function getServicesWithinRadius(lat, lon, maxDistance) {
    try {
        const services = await Repository.getAll();
        const filteredServices = services.filter(service => {
            const distance = calculateDistance(lat, lon, service.latitude, service.longitude);
            return distance <= maxDistance;
        });

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
    return services.map((service) => ({ ...service }));
}

async function getAppartementById(id) {
    const appartement = await Repository.getAppartementById(id);
    return { ...appartement };
}

async function updateOne(id, service, issuer) {
    if (["customer", "owner", "provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You cannot update services.");
    }

    const { value, error } = updateServicesSchema.validate(service);
    if (error) {
        throw error;
    }

    const newService = await Repository.updateOne(id, value);

    if (newService) {
        return { ...newService };
    }

    return newService;
}

async function deleteOne(id, issuer) {
    if (["customer", "owner", "provider"].includes(issuer.role)) {
        throw new UnauthorizedError("You cannot delete a service.");
    }

    return await Repository.deleteOne(id);
}

module.exports = {
    createOne,
    createType,
    addServiceToProvider,
    createProviderWithServices,
    getOne,
    getAll,
    getServicesWithinRadius,
    getAppartementById,
    updateOne,
    deleteOne
};
