const db = require("../common/db_handler");
const pgp = require("pg-promise")();

// Création d'un service
async function createOne(service) {
    // Utiliser pg-promise helpers pour gérer l'insertion
    return await db.one(
        pgp.helpers.insert(service, null, "servicesProviders") + " RETURNING *;"
    );
}

// Crée un type de service
async function createType(type, apartmentFeature = null) {
    // Utiliser pg-promise helpers pour gérer l'insertion
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

module.exports = {createOne, createType, getOne, getAll, getAppartementById, updateOne, deleteOne, getOneBy};
