const {
    createServicesSchema,
    updateServicesSchema,
    createServicesTypeSchema,
    addServiceToProviderSchema
} = require("./model");
const Repository = require("./repository");
const apartmentsRepository = require("../apartments/repository");
const distCalc = require("../common/middlewares/distanceCalculation_middleware");
const {InvalidArgumentError, UnauthorizedError} = require("../common/service_errors");
const {getGeoCoordinates} = require("../common/middlewares/gps_middleware");

async function createOne(serviceData) {
    console.log('Service data received:', serviceData);

    const {value, error} = createServicesSchema.validate(serviceData);
    if (error) {
        console.log('Validation error:', error.details);
        throw error;
    }
    console.log('Validated data:', value);

    const existingService = await Repository.getOneBy('name', value.name);
    if (existingService) {
        console.log('Service name already taken:', value.name);
        throw new InvalidArgumentError('This service name is already taken.');
    }

    const coordinates = await getGeoCoordinates(value.address);
    if (!coordinates) {
        console.log('Failed to geocode address:', value.address);
        throw new Error('Failed to geocode address.');
    }
    console.log('Geocoded coordinates:', coordinates);

    value.address.latitude = coordinates.latitude;
    value.address.longitude = coordinates.longitude;

    const providerId = await Repository.createProviderWithServices(value, value.services);
    console.log('Service provider created with ID:', providerId);

    if (value.imagePaths) {
        const imageUploadPromises = value.imagePaths.map(path =>
            Repository.uploadServiceImage(providerId, {path, serviceTypeId: null})
        );
        await Promise.all(imageUploadPromises);
        console.log('Service images uploaded:', value.imagePaths);
    }

    return {message: 'Service created successfully', id: providerId};
}

async function createType(serviceData, features = []) {
    const {value, error} = createServicesTypeSchema.validate({...serviceData, features});
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

async function addServiceToProvider(provider_id, serviceType_id, price) {
    console.log('Service data received for adding to provider:', {provider_id, serviceType_id, price});

    const serviceData = {provider_id, serviceType_id, price};
    const {value, error} = addServiceToProviderSchema.validate(serviceData);
    if (error) {
        console.error('Validation error:', error.details);
        throw new Error(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    }

    const provider = await Repository.getServiceProviderById(provider_id);
    if (!provider) {
        console.error('Provider not found:', provider_id);
        throw new Error('Provider not found');
    }

    console.log('Provider found:', provider);

    try {
        const result = await Repository.addServiceToProvider(provider_id, value);
        console.log('Service added to provider in database:', result);
        return {message: 'Service added to provider successfully', result};
    } catch (err) {
        console.error('Error in adding service to provider:', err);
        throw err;
    }
}

async function getOne(id, issuer) {
    if (["provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only see your own service.");
    }

    const service = await Repository.getOne(id);
    if (service) {
        return {...service};
    } else return service;
}

async function getServicesWithinRadius(apartment_id, maxDistance) {
    try {
        // Récupérer les coordonnées de l'appartement
        const { latitude, longitude } = await apartmentsRepository.getLongAndLat(apartment_id);
        console.log(`Apartment coordinates: latitude=${latitude}, longitude=${longitude}`);

        // Récupérer la liste des services avec leurs données et leurs coordonnées
        const services = await Repository.getAllServicesWithCoordinates();
        console.log('All service providers with coordinates fetched:', services);

        // Filtrer les services en fonction de la distance
        const servicesWithinRadius = services.filter(service => {
            const distance = distCalc.calculateDistance(latitude, longitude, service.latitude, service.longitude);
            console.log(`Distance to service ${service.provider_name}: ${distance} km`);
            return distance <= maxDistance;
        });
        console.log("Distance Choisie: ",maxDistance)
        console.log('Services within radius:', servicesWithinRadius);
        return servicesWithinRadius;
    } catch (error) {
        console.error(`Error fetching services within radius for apartment_id ${apartment_id}:`, error);
        throw new Error("Failed to fetch services within radius");
    }
}


async function getAll() {
    const services = await Repository.getAll();
    return services.map((service) => ({...service}));
}

async function getAllType() {
    const services = await Repository.getAllType();
    return services.map((service) => ({...service}));
}


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
    getOne,
    getAll,
    getServicesWithinRadius,
    updateOne,
    deleteOne,
    getAllType
};
