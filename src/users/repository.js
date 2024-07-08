const db = require("../common/db_handler");
const { InvalidArgumentError } = require("../common/service_errors");
const availableServices = require("../serviceCalendar/repository");

async function createAddress(client, address) {
    try {
        const result = await client.one(
            `INSERT INTO address (number, street, CP, town, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING address_id`,
            [address.number, address.street, address.CP, address.town, address.latitude, address.longitude]
        );
        return result.address_id;
    } catch (err) {
        console.error('Error creating address:', err);
        throw err;
    }
}

async function createServiceProvider(client, service) {
    try {
        const result = await client.one(
            `INSERT INTO servicesProviders (name, telephone, address_id, maxOperatingRadius, employee_count)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING servicesProviders_id`,
            [service.name, service.telephone, service.address_id, service.maxOperatingRadius, service.employee_count]
        );
        return result.servicesproviders_id;
    } catch (err) {
        console.error('Error creating service provider:', err);
        throw err;
    }
}

async function getServiceProviderById(providerId) {
    try {
        const result = await db.oneOrNone('SELECT * FROM servicesProviders WHERE servicesProviders_id = $1', [providerId]);
        return result;
    } catch (err) {
        console.error('Error fetching service provider:', err);
        throw err;
    }
}

async function addServiceToProvider(client, providerId, value) {
    try {
        await client.none(
            `INSERT INTO serviceProviderToServiceTypes (serviceProvider_id, serviceType_id, price)
             VALUES ($1, $2, $3)`,
            [providerId, value.serviceType_id, value.price]
        );
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
        const query = `
            SELECT sp.*,
                   a.*,
                   (SELECT json_agg(row_to_json(s))
                    FROM (SELECT st.name, sptst.price
                          FROM serviceProviderToServiceTypes sptst
                                   JOIN serviceTypes st ON sptst.serviceType_id = st.serviceTypes_id
                          WHERE sptst.serviceProvider_id = sp.servicesProviders_id) s) AS services
            FROM servicesProviders sp
                     LEFT JOIN address a ON sp.address_id = a.address_id
            WHERE sp.servicesProviders_id = $1
        `;
        return await db.oneOrNone(query, [id]);
    } catch (err) {
        console.error('Error fetching one service provider:', err);
        throw err;
    }
}

async function getOneBy(attribute, value) {
    try {
        return await db.oneOrNone(`SELECT *
                                   FROM users
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

async function getAllServicesWithCoordinates() {
    try {
        const res = await db.manyOrNone(`
            SELECT sp.servicesProviders_id,
                   sp.name AS provider_name,
                   sp.telephone,
                   sp.maxOperatingRadius,
                   sp.employee_count,
                   a.latitude,
                   a.longitude,
                   a.town  AS city,
                   json_agg(
                           json_build_object(
                                   'serviceType_id', st.serviceTypes_id,
                                   'serviceType_name', st.name,
                                   'price', spts.price
                           )
                   )       AS services
            FROM servicesProviders sp
                     LEFT JOIN address a ON sp.address_id = a.address_id
                     LEFT JOIN serviceProviderToServiceTypes spts ON sp.servicesProviders_id = spts.serviceProvider_id
                     LEFT JOIN serviceTypes st ON spts.serviceType_id = st.serviceTypes_id
            GROUP BY sp.servicesProviders_id, a.latitude, a.longitude, a.town
        `);
        console.log('All service providers with coordinates fetched:', res);
        return res || [];
    } catch (err) {
        console.error('Error fetching all service providers with coordinates:', err);
        throw err;
    }
}

async function getAll() {
    try {
        const res = await db.manyOrNone(`
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
        console.log('All service providers fetched:', res);
        return res || [];
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
        const query = `
            UPDATE servicesProviders
            SET ${Object.keys(service).map((key, i) => `${key} = $${i + 2}`).join(', ')}
            WHERE servicesProviders_id = $1
            RETURNING *;
        `;
        const values = [id, ...Object.values(service)];
        return await db.oneOrNone(query, values);
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

async function resetPrimaryKeySequence(tableName, primaryKeyColumn) {
    const sequenceName = `${tableName}_${primaryKeyColumn}_seq`;
    const query = `
        SELECT setval('${sequenceName}', COALESCE((SELECT MAX(${primaryKeyColumn}) FROM ${tableName}) + 1, 1), false);
    `;
    try {
        await db.none(query);
        console.log(`Sequence ${sequenceName} has been reset.`);
    } catch (error) {
        console.error(`Failed to reset sequence ${sequenceName}:`, error);
    }
}

async function createProviderWithServices(providerValue, services) {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        providerValue.address_id = await createAddress(client, providerValue.address);

        const createdProviderId = await createServiceProvider(client, providerValue);

        // Commit the transaction for provider creation
        await client.query('COMMIT');

        // Begin a new transaction for the availabilities and services
        await client.query('BEGIN');

        for (const service of services) {
            console.log('Adding service:', service.name, 'to provider:', createdProviderId);
            const serviceTypeId = await getServiceTypeIdByName(service.name);
            if (!serviceTypeId) {
                throw new InvalidArgumentError(`Service type ${service.name} not found`);
            }
            await addServiceToProvider(client, createdProviderId, {
                serviceType_id: serviceTypeId,
                price: service.price
            });
        }

        await availableServices.createAvailabilities(createdProviderId);

        await client.query('COMMIT');
        return createdProviderId;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error in transaction, rollback:', err);
        await resetPrimaryKeySequence('servicesProviders', 'servicesProviders_id');
        await resetPrimaryKeySequence('address', 'address_id');
        throw err;
    } finally {
        client.release();
    }
}

async function createProvider(provider) {
    return await db.tx(async t => {
        // Créer l'utilisateur avec le rôle 'provider'
        const userAttributes = {
            role: 'provider',
            email: provider.email,
            password: provider.password,
            telephone: provider.telephone || null
        };

        const newUser = await t.one(
            `INSERT INTO users (role, email, password, telephone)
             VALUES ($1, $2, $3, $4)
             RETURNING *;`,
            [userAttributes.role, userAttributes.email, userAttributes.password, userAttributes.telephone]
        );
        return newUser;
    });
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
    getAllServicesWithCoordinates,
    createProvider
};
