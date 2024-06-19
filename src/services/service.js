const { createServicesSchema, updateServicesSchema, createServicesTypeSchema, addServiceToProviderSchema } = require("./model");
const Repository = require("./repository");
const { calculateDistance } = require("../common/middlewares/distanceCalculation_middleware");
const { InvalidArgumentError, UnauthorizedError } = require("../common/service_errors");
const { getGeoCoordinates } = require("../common/middlewares/gps_middleware");

async function createOne(serviceData) {
    console.log('Service data received:', serviceData);

    const { value, error } = createServicesSchema.validate(serviceData);
    if (error) {
        console.log('Validation error:', error.details);
        throw error;
    }
    console.log('Validated data:', value);

    const existingService = await Repository.getOneBy('name', value.companyName);
    if (existingService) {
        console.log('Service name already taken:', value.companyName);
        throw new InvalidArgumentError('This service name is already taken.');
    }

    const coordinates = await getGeoCoordinates(value.address);
    if (!coordinates) {
        console.log('Failed to geocode address:', value.address);
        throw new Error('Failed to geocode address.');
    }
    console.log('Geocoded coordinates:', coordinates);

    value.latitude = coordinates.latitude;
    value.longitude = coordinates.longitude;

    const addressId = await Repository.createAddress(value.address);
    value.address_id = addressId;
    console.log('Address ID:', addressId);

    const serviceProviderId = await Repository.createServiceProvider(value);
    console.log('Service provider ID:', serviceProviderId);

    const serviceTypePromises = value.services.map(service =>
        Repository.createServiceProviderToServiceType(serviceProviderId, service)
    );
    await Promise.all(serviceTypePromises);
    console.log('Service types linked:', value.services);

    if (value.imagePaths) {
        const imageUploadPromises = value.imagePaths.map(path =>
            Repository.uploadServiceImage(serviceProviderId, { path, serviceTypeId: null })
        );
        await Promise.all(imageUploadPromises);
        console.log('Service images uploaded:', value.imagePaths);
    }

    return { message: 'Service created successfully', id: serviceProviderId };
}

async function createType(serviceData, features = []) {
    const { value, error } = createServicesTypeSchema.validate({ ...serviceData, features });
    if (error) {
        console.error('Validation error:', error);
        throw error;
    }

    const existingServiceType = await Repository.getOneBy("name", value.name);
    if (existingServiceType) {
        throw new InvalidArgumentError("This service type name is already taken.");
    }
    console.log("new service : ", value, features);
    return await Repository.createServiceType(value, features);
}

async function addServiceToProvider(providerId, serviceData) {
    console.log('Service data received for adding to provider:', { providerId, serviceData });

    const { value, error } = addServiceToProviderSchema.validate(serviceData);
    if (error) {
        console.error('Validation error:', error.details);
        throw new Error(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    }

    console.log('Validated service data:', value);

    const provider = await Repository.getServiceProviderById(providerId);
    if (!provider) {
        console.error('Provider not found:', providerId);
        throw new Error('Provider not found');
    }

    console.log('Provider found:', provider);

    try {
        const result = await Repository.addServiceToProvider(providerId, value);
        console.log('Service added to provider in database:', result);
        return { message: 'Service added to provider successfully', result };
    } catch (err) {
        console.error('Error in adding service to provider:', err);
        throw err;
    }
}

async function createProviderWithServices(providerData) {
    const { value: providerValue, error: providerError } = createServicesSchema.validate(providerData);
    if (providerError) {
        throw providerError;
    }

    const coordinates = await getGeoCoordinates(providerValue.address);
    if (!coordinates) {
        throw new Error("Failed to geocode address.");
    }

    providerValue.latitude = coordinates.latitude;
    providerValue.longitude = coordinates.longitude;

    const addressId = await Repository.createAddress(providerValue.address);
    providerValue.address_id = addressId;

    const createdProviderId = await Repository.createServiceProvider(providerValue);

    for (const service of providerValue.services) {
        await Repository.createServiceProviderToServiceType(createdProviderId, service);
    }

    if (providerValue.imagePaths) {
        for (const imagePath of providerValue.imagePaths) {
            await Repository.uploadServiceImage(createdProviderId, { path: imagePath });
        }
    }

    return { provider_id: createdProviderId };
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

async function getAllType() {
    const services = await Repository.getAllType();
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
    deleteOne,
    getAllType
};
