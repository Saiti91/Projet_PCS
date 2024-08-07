const db = require("../common/db_handler");
const {
    createServicesSchema,
    updateServicesSchema,
    createServicesTypeSchema,
    addServiceToProviderSchema
} = require("./model");
const Repository = require("./repository");
const UserRepository = require("../users/repository");
const apartmentsRepository = require("../apartments/repository");
const availableServicesRepository = require("../servicesCalendar/repository");
const distCalc = require("../common/middlewares/distanceCalculation_middleware");
const { InvalidArgumentError, UnauthorizedError } = require("../common/service_errors");
const { getGeoCoordinates } = require("../common/middlewares/gps_middleware");



async function createRequestOne(serviceData) {
    console.log('Service data received:', serviceData);

    const { value, error } = createServicesSchema.validate(serviceData);
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

    let providerId;
    const existingUser = await UserRepository.getOneBy('email', value.email);
    const userProvider = {
        name: value.name,
        role: 'provider',
        email: value.email,
        password: 'password',
        telephone: value.phone
    };
    if (existingUser) {
        providerId = await UserRepository.createRequestProvider(userProvider, value.address);
    }

    const coordinates = await getGeoCoordinates(value.address);
    if (!coordinates) {
        console.log('Failed to geocode address:', value.address);
        throw new Error('Failed to geocode address.');
    }
    value.address.latitude = coordinates.latitude;
    value.address.longitude = coordinates.longitude;

    try {
        await db.tx(async t => {
            value.address_id = await Repository.createAddress(t, value.address);

            for (const service of value.services) {
                const serviceTypeId = await Repository.getServiceTypeIdByName(service.name);
                if (!serviceTypeId) {
                    throw new InvalidArgumentError(`Service type ${service.name} not found`);
                }
                console.log('Adding service:', service.name, 'to provider:', providerId.serviceprovider_id);
                await Repository.addServiceToProvider(t, providerId.serviceprovider_id, { serviceType_id: serviceTypeId, price: service.price });
            }

            await availableServicesRepository.createAvailabilities(providerId.serviceprovider_id, t);
        });
        return { message: 'Service created successfully', id: providerId.serviceprovider_id };
    } catch (error) {
        console.error("Error creating location:", error);
        throw new InvalidArgumentError("Failed to create location.");
    }
}

async function createOne(serviceData) {
    console.log('Service data received:', serviceData);

    const { value, error } = createServicesSchema.validate(serviceData);
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

    let providerId;
    const existingUser = await UserRepository.getOneBy('email', value.email);
    if (!existingUser) {
        const userProvider = {
            name: value.name,
            role: 'provider',
            email: value.email,
            password: 'password',
            telephone: value.phone
        };
        providerId = await UserRepository.createProvider(userProvider, value.address);
        console.log('User created with provider ID:', providerId);
    } else {
        providerId = existingUser.provider_id;
    }

    const coordinates = await getGeoCoordinates(value.address);
    if (!coordinates) {
        console.log('Failed to geocode address:', value.address);
        throw new Error('Failed to geocode address.');
    }
    value.address.latitude = coordinates.latitude;
    value.address.longitude = coordinates.longitude;

    try {
        await db.tx(async t => {
            value.address_id = await Repository.createAddress(t, value.address);

            for (const service of value.services) {
                const serviceTypeId = await Repository.getServiceTypeIdByName(service.name);
                if (!serviceTypeId) {
                    throw new InvalidArgumentError(`Service type ${service.name} not found`);
                }
                console.log('Adding service:', service.name, 'to provider:', providerId.serviceprovider_id);
                await Repository.addServiceToProvider(t, providerId.serviceprovider_id, { serviceType_id: serviceTypeId, price: service.price });
            }

            await availableServicesRepository.createAvailabilities(providerId.serviceprovider_id, t);
        });
        return { message: 'Service created successfully', id: providerId.serviceprovider_id };
    } catch (error) {
        console.error("Error creating location:", error);
        throw new InvalidArgumentError("Failed to create location.");
    }
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
    console.log("New service type:", value, features);
    return await Repository.createServiceType(value, features);
}

async function addServiceToProvider(provider_id, serviceType_id, price) {
    console.log('Service data received for adding to provider:', { provider_id, serviceType_id, price });

    const serviceData = { provider_id, serviceType_id, price };
    const { value, error } = addServiceToProviderSchema.validate(serviceData);
    if (error) {
        console.error('Validation error:', error.details);
        throw new Error(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    }

    const provider = await Repository.getServiceProviderById(provider_id);
    if (!provider) {
        console.error('Provider not found:', provider_id);
        throw new Error('Provider not found');
    }

    console.log('Provider found:', provider, 'Adding service:', value);

    try {
        const result = await Repository.addServiceToProvider(provider_id, value);
        console.log('Service added to provider in database:', result);
        return { message: 'Service added to provider successfully', result };
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
        return { ...service };
    } else {
        return service;
    }
}

async function getServicesWithinRadius(apartment_id, maxDistance) {
    try {
        const { latitude, longitude } = await apartmentsRepository.getOne(apartment_id);

        const services = await Repository.getAllServicesWithCoordinates();

        return services.filter(service => {
            const distance = distCalc.calculateDistance(latitude, longitude, service.latitude, service.longitude);
            return distance <= maxDistance;
        });
    } catch (error) {
        console.error(`Error fetching services within radius for apartment_id ${apartment_id}:`, error);
        throw new Error("Failed to fetch services within radius");
    }
}

async function getAll() {
    const services = await Repository.getAll();
    return services.map(service => ({ ...service }));
}

async function getAllType() {
    const services = await Repository.getAllType();
    return services.map(service => ({ ...service }));
}

async function getAllRequested() {
    const services = await Repository.getAll();
    return services.map(service => ({ ...service }));
}

async function getOneRequested(id, issuer) {
    if (["provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only see your own service.");
    }

    const service = await Repository.getOne(id);
    if (service) {
        return { ...service };
    } else {
        return service;
    }
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

async function deleteRequestOne(id, issuer) {
    if (["customer", "owner", "provider"].includes(issuer.role)) {
        throw new UnauthorizedError("You cannot delete a service.");
    }

    return await Repository.deleteOne(id);
}

module.exports = {
    createOne,
    createType,
    deleteRequestOne,
    addServiceToProvider,
    getOne,
    getAll,
    getServicesWithinRadius,
    updateOne,
    deleteOne,
    getAllType,
    getAllRequested,
    getOneRequested
};
