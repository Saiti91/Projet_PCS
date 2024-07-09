const db = require("../common/db_handler");
const generateDates = require('../common/middlewares/generateDate');

// Créer des disponibilités pour un fournisseur de services
async function createAvailabilities(providerId,serviceType_id) {
    const dates = generateDates(360); // Générer 360 dates à partir d'aujourd'hui

    try {
        await db.tx(async t => {
            const insertAvailabilityQueries = dates.map(date => {
                return t.none(
                    `INSERT INTO providerAvailabilities (date, status_id,serviceType_id, provider_id)
                     VALUES ($1,$2, $3,$4)`,
                    [date, 1,serviceType_id, providerId]
                );
            });
            await t.batch(insertAvailabilityQueries);
        });
        console.log('Successfully inserted 360 availabilities for provider');
    } catch (error) {
        console.error("Failed to create availabilities:", error);
        throw error;
    }
}

// Récupérer les disponibilités d'un fournisseur de services par ID
async function getById(providerId) {
    try {
        return await db.any(
            `SELECT *
             FROM providerAvailabilities
             WHERE provider_id = $1
             ORDER BY date`,
            [providerId]
        );
    } catch (error) {
        console.error("Failed to retrieve availabilities:", error);
        throw error;
    }
}

// Récupérer toutes les disponibilités des fournisseurs de services
async function getAllAvailabilities() {
    try {
        return await db.any(
            `SELECT *
             FROM providerAvailabilities
             ORDER BY provider_id, date`
        );
    } catch (error) {
        console.error("Failed to retrieve all availabilities:", error);
        throw error;
    }
}

// Mettre à jour les disponibilités d'un fournisseur de services
async function updateAvailabilities(providerId, availabilities) {
    try {
        await db.tx(async t => {
            const updateQueries = availabilities.map(({ date, serviceType_id }) => {
                return t.none(
                    `UPDATE providerAvailabilities
                     SET status_id = $1, serviceType_id = $4
                     WHERE provider_id = $2
                       AND date = $3`,
                    [3, providerId, date, serviceType_id]
                );
            });
            await t.batch(updateQueries);
        });
        console.log('Successfully updated availabilities for provider');
    } catch (error) {
        console.error("Failed to update availabilities:", error);
        throw error;
    }
}



// Supprimer les disponibilités d'un fournisseur de services par ID
async function deleteAvailabilitiesByProviderId(providerId) {
    try {
        await db.none(
            `DELETE
             FROM providerAvailabilities
             WHERE provider_id = $1`,
            [providerId]
        );
        console.log(`Successfully deleted availabilities for provider_id ${providerId}`);
    } catch (error) {
        console.error("Failed to delete availabilities:", error);
        throw error;
    }
}

// Exportation des fonctions pour utilisation dans d'autres parties du code
module.exports = {
    createAvailabilities,
    getById,
    getAllAvailabilities,
    updateAvailabilities,
    deleteAvailabilitiesByProviderId
};
