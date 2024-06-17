// services/repository.js
const db = require("../common/db_handler");
const pgp = require("pg-promise")();

// Création d'un service
async function createOne(service) {
    return await db.one(
        pgp.helpers.insert(service, null, "servicesProviders") + " RETURNING *;"
    );
}

// Crée un type de service
async function createType(type, apartmentFeature = null) {
    const createdType = await db.one(
        pgp.helpers.insert(type, null, "serviceTypes") + " RETURNING *;"
    );

    if (apartmentFeature) {
        await db.none(
            `INSERT INTO serviceTypeToFeatures(serviceType_id, apartmentFeature)
             VALUES ($1, $2);`,
            [createdType.serviceTypes_id, apartmentFeature]
        );
    }

    return createdType;
}

// Ajouter un service à une entreprise existante
async function addServiceToProvider(serviceProviderId, service) {
    return await db.none(
        `INSERT INTO serviceProviderToServiceTypes(serviceProvider_id, serviceType_id, price)
         VALUES ($1, $2, $3);`,
        [serviceProviderId, service.serviceType_id, service.price]
    );
}

// Crée une entreprise avec ses services
async function createProviderWithServices(provider, services) {
    const createdProvider = await db.one(
        pgp.helpers.insert(provider, null, "servicesProviders") + " RETURNING *;"
    );

    for (const service of services) {
        await db.none(
            `INSERT INTO serviceProviderToServiceTypes(serviceProvider_id, serviceType_id, price)
             VALUES ($1, $2, $3);`,
            [createdProvider.servicesProviders_id, service.serviceType_id, service.price]
        );
    }

    return createdProvider;
}

// Récupère un service en fonction de son ID
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM servicesProviders WHERE servicesProviders_id = $1", [id]);
}

// Récupère un ou plusieurs services en fonction d'un attribut
async function getOneBy(attribute, value) {
    return await db.oneOrNone(
        `SELECT *
         FROM servicesProviders
         WHERE ${attribute} = $1`, [value]
    );
}

// Récupère la longitude et latitude d'un appartement en fonction de son ID
async function getAppartementById(id) {
    try {
        return await db.oneOrNone(`
                    SELECT address.longitude, address.latitude
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

// Récupère tous les services
async function getAll() {
    return await db.manyOrNone("SELECT * FROM servicesProviders");
}

// Update un service
async function updateOne(id, service) {
    const attrsStr = pgp.helpers.update(service, null, "servicesProviders") + ` WHERE servicesProviders_id = $1 RETURNING *;`;
    return await db.oneOrNone(attrsStr, [id]);
}

// Supprime un service par son ID
async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM servicesProviders WHERE servicesProviders_id = $1 RETURNING servicesProviders_id;", [id]);
}

module.exports = {
    createOne,
    createType,
    addServiceToProvider,
    createProviderWithServices,
    getOne,
    getAll,
    getAppartementById,
    updateOne,
    deleteOne,
    getOneBy
};
