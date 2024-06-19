const db = require("../common/db_handler");

// Création d'une adresse
async function createAddress(address) {
    const result = await db.one(
        `INSERT INTO address (number, street, CP, town, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING address_id`,
        [address.number, address.street, address.CP, address.town, address.latitude, address.longitude]
    );
    console.log('Address created with ID:', result.address_id);
    return result.address_id;
}

// Création d'un prestataire de service
async function createServiceProvider(service) {
    const result = await db.one(
        `INSERT INTO servicesProviders (name, telephone, address_id, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING servicesProviders_id`,
        [service.name, service.phone, service.address_id, service.latitude, service.longitude]
    );
    console.log('Service provider created with ID:', result.servicesproviders_id);
    return result.servicesproviders_id;
}

async function getServiceProviderById(providerId) {
    console.log('Fetching service provider by ID:', providerId);
    const result = await db.oneOrNone('SELECT * FROM servicesProviders WHERE servicesProviders_id = $1', [providerId]);
    console.log('Service provider fetched:', result);
    return result;
}

async function addServiceToProvider(providerId, service) {
    try {
        console.log('Adding service to provider in database:', { providerId, service });
        const result = await db.one(
            `INSERT INTO serviceProviderToServiceTypes (serviceProvider_id, serviceType_id, price)
             VALUES ($1, $2, $3)
             RETURNING serviceProvider_id, serviceType_id`,
            [providerId, service.serviceType_id, service.price]
        );
        console.log('Service added to provider in database:', result);
        return result;
    } catch (err) {
        console.error('Database error in adding service to provider:', err);
        throw err;
    }
}

async function createServiceProviderToServiceType(serviceProviderId, service) {
    const result = await db.one(
        `INSERT INTO serviceProviderToServiceTypes (serviceProvider_id, serviceType_id, price)
         VALUES ($1, $2, $3)
         RETURNING serviceProvider_id`,
        [serviceProviderId, service.id, service.price]
    );
    console.log('Service type linked:', result.serviceProvider_id, 'with service type ID:', service.id);
}

async function uploadServiceImage(serviceProviderId, image) {
    return await db.one(
        `INSERT INTO servicesImage (service_id, path, serviceType_id)
         VALUES ($1, $2, $3)
         RETURNING image_id`,
        [serviceProviderId, image.path, image.serviceTypeId]
    );
}

async function createServiceType(type, features = []) {
    const createdType = await db.one(
        `INSERT INTO serviceTypes (name)
         VALUES ($1)
         RETURNING servicetypes_id;`,
        [type.name]
    );
    const createdTypeid = createdType.servicetypes_id;

    if (features.length > 0) {
        const featureIds = await Promise.all(features.map(async feature => {
            const result = await db.one(
                `SELECT feature_id
                 FROM apartmentFeatures
                 WHERE name = $1;`,
                [feature]
            );
            return result.feature_id;
        }));
        const queries = featureIds.map(featureId => {
            return db.none(
                `INSERT INTO serviceTypeToFeatures (serviceType_id, apartmentFeature)
                 VALUES ($1, $2);`,
                [createdTypeid, featureId]
            );
        });
        await Promise.all(queries);
    }

    return createdType;
}

async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM servicesProviders WHERE servicesProviders_id = $1", [id]);
}

async function getOneBy(attribute, value) {
    return await db.oneOrNone(`SELECT * FROM servicesProviders WHERE ${attribute} = $1`, [value]);
}

async function getAppartementById(id) {
    try {
        return await db.oneOrNone(
            `SELECT address.longitude, address.latitude
             FROM address
             JOIN apartments ON apartments.address_id = address.address_id
             WHERE apartments.apartments_id = $1`,
            [id]
        );
    } catch (error) {
        console.error("Error fetching appartement details:", error);
        throw error;
    }
}

async function getAll() {
    return await db.manyOrNone("SELECT * FROM servicesProviders");
}

async function getAllType() {
    return await db.manyOrNone("SELECT * FROM servicetypes");
}

async function updateOne(id, service) {
    const attrsStr = pgp.helpers.update(service, null, "servicesProviders") + ` WHERE servicesProviders_id = $1 RETURNING *;`;
    return await db.oneOrNone(attrsStr, [id]);
}

async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM servicesProviders WHERE servicesProviders_id = $1 RETURNING servicesProviders_id;", [id]);
}

module.exports = {
    uploadServiceImage,
    getServiceProviderById,
    createAddress,
    createServiceProvider,
    createServiceProviderToServiceType,
    createServiceType,
    addServiceToProvider,
    getOne,
    getAll,
    getAppartementById,
    updateOne,
    deleteOne,
    getOneBy,
    getAllType
};
