const db = require("../common/db_handler");
const {InvalidArgumentError} = require("../common/service_errors");

// Create an address
async function createAddress(client, address) {
    try {
        const result = await client.one(
            `INSERT INTO address (number, street, CP, town, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING address_id`,
            [address.number, address.street, address.CP, address.town, address.latitude, address.longitude]
        );
        console.log('Address created with ID:', result.address_id);
        return result.address_id;
    } catch (err) {
        console.error('Error creating address:', err);
        throw err;
    }
}

// Create a service provider
async function createServiceProvider(client, service) {
    try {
        const result = await client.one(
            `INSERT INTO servicesProviders (name, telephone, address_id, maxOperatingRadius, employee_count)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING servicesProviders_id`,
            [service.name, service.telephone, service.address_id, service.maxOperatingRadius, service.employee_count]
        );
        console.log('Service provider created with ID:', result.servicesproviders_id);
        return result.servicesproviders_id;
    } catch (err) {
        console.error('Error creating service provider:', err);
        throw err;
    }
}

async function getServiceProviderById(providerId) {
    try {
        console.log('Fetching service provider by ID:', providerId);
        const result = await db.oneOrNone('SELECT * FROM servicesProviders WHERE servicesProviders_id = $1', [providerId]);
        console.log('Service provider fetched:', result);
        return result;
    } catch (err) {
        console.error('Error fetching service provider:', err);
        throw err;
    }
}

async function addServiceToProvider(providerId) {
    try {
        console.log('Adding service to provider in database:', {providerId});
        const result = await db.one(
            `INSERT INTO serviceProviderToServiceTypes (serviceProvider_id, serviceType_id, price)
             VALUES ($1, $2, $3)
             RETURNING serviceProvider_id, serviceType_id`,
            [providerId.provider_id, providerId.serviceType_id, providerId.price]
        );
        console.log('Service added to provider in database:', result);
        return result;
    } catch (err) {
        console.error('Database error in adding service to provider:', err);
        throw err;
    }
}


async function uploadServiceImage(client, serviceProviderId, image) {
    try {
        const result = await client.one(
            `INSERT INTO servicesImage (service_id, path, serviceType_id)
             VALUES ($1, $2, $3)
             RETURNING image_id`,
            [serviceProviderId, image.path, image.serviceType_id]
        );
        console.log('Service image uploaded with ID:', result.image_id);
        return result.image_id;
    } catch (err) {
        console.error('Error uploading service image:', err);
        throw err;
    }
}

async function createServiceType(type, features = []) {
    try {
        const createdType = await db.one(
            `INSERT INTO serviceTypes (name)
             VALUES ($1)
             RETURNING serviceTypes_id`,
            [type.name]
        );
        const createdTypeId = createdType.serviceTypes_id;

        if (features.length > 0) {
            const featureIds = await Promise.all(features.map(async feature => {
                const result = await db.one(
                    `SELECT feature_id
                     FROM apartmentFeatures
                     WHERE name = $1`,
                    [feature]
                );
                return result.feature_id;
            }));
            const queries = featureIds.map(featureId => {
                return db.none(
                    `INSERT INTO serviceTypeToFeatures (serviceType_id, apartmentFeature)
                     VALUES ($1, $2)`,
                    [createdTypeId, featureId]
                );
            });
            await Promise.all(queries);
        }

        return createdType;
    } catch (err) {
        console.error('Error creating service type:', err);
        throw err;
    }
}

async function getOne(id) {
    try {
        return await db.oneOrNone("SELECT * FROM servicesProviders WHERE servicesProviders_id = $1", [id]);
    } catch (err) {
        console.error('Error fetching one service provider:', err);
        throw err;
    }
}

async function getOneBy(attribute, value) {
    try {
        return await db.oneOrNone(`SELECT *
                                   FROM servicesProviders
                                   WHERE ${attribute} = $1`, [value]);
    } catch (err) {
        console.error('Error fetching service provider by attribute:', err);
        throw err;
    }
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
        console.error("Error fetching apartment details:", error);
        throw error;
    }
}

async function getAll() {
    try {
        return await db.manyOrNone(`
            SELECT sp.*,
                   a.town AS city,
                   json_agg(
                           json_build_object(
                                   'serviceType_id', spts.serviceType_id,
                                   'serviceType_name', st.name,
                                   'price', spts.price
                           )
                   )      AS services
            FROM servicesProviders sp
                     LEFT JOIN address a ON sp.address_id = a.address_id
                     LEFT JOIN serviceProviderToServiceTypes spts ON sp.servicesProviders_id = spts.serviceProvider_id
                     LEFT JOIN serviceTypes st ON spts.serviceType_id = st.serviceTypes_id
            GROUP BY sp.servicesProviders_id, a.town
        `);
    } catch (err) {
        console.error('Error fetching all service providers:', err);
        throw err;
    }
}

async function getAllType() {
    try {
        return await db.manyOrNone("SELECT * FROM serviceTypes");
    } catch (err) {
        console.error('Error fetching all service types:', err);
        throw err;
    }
}

async function updateOne(id, service) {
    try {
        const attrsStr = pgp.helpers.update(service, null, "servicesProviders") + ` WHERE servicesProviders_id = $1 RETURNING *;`;
        return await db.oneOrNone(attrsStr, [id]);
    } catch (err) {
        console.error('Error updating service provider:', err);
        throw err;
    }
}

async function deleteOne(id) {
    try {
        return await db.oneOrNone("DELETE FROM servicesProviders WHERE servicesProviders_id = $1 RETURNING servicesProviders_id;", [id]);
    } catch (err) {
        console.error('Error deleting service provider:', err);
        throw err;
    }
}

// Get service type ID by name
async function getServiceTypeIdByName(name) {
    try {
        const result = await db.one(
            `SELECT serviceTypes_id
             FROM serviceTypes
             WHERE name = $1`,
            [name]
        );
        return result.servicetypes_id;
    } catch (err) {
        console.error('Error fetching service type ID by name:', err);
        throw err;
    }
}

// Create a service provider with services in a transaction
async function createProviderWithServices(providerValue, services) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        providerValue.address_id = await createAddress(client, providerValue.address);

        const createdProviderId = await createServiceProvider(client, providerValue);

        for (const service of services) {
            console.log('Adding service:', service.name, 'to provider:', createdProviderId)
            const serviceTypeId = await getServiceTypeIdByName(service.name);
            if (!serviceTypeId) {
                throw new InvalidArgumentError(`Service type ${service.name} not found`);
            }
            await addServiceToProvider(client, createdProviderId, {
                serviceType_id: serviceTypeId,
                price: service.price
            });
        }

        await client.query('COMMIT');
        return createdProviderId;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in transaction, rollback:', err);
        throw err;
    }
}

module.exports = {
    uploadServiceImage,
    getServiceProviderById,
    createServiceType,
    addServiceToProvider,
    getOne,
    getAll,
    getAppartementById,
    updateOne,
    deleteOne,
    getOneBy,
    getAllType,
    createProviderWithServices,
    getServiceTypeIdByName
};
