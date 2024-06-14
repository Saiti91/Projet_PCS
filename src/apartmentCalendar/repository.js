const db = require("../common/db_handler");
const generateDates = require('../common/middlewares/generateDate')

async function createAvailabilities(apartmentId) {
    const dates = generateDates(1); // Generate 720 dates from today

    try {
        await db.tx(async t => {
            const insertAvailabilityQueries = dates.map(date => {
                return t.none(
                    `INSERT INTO apartmentAvailabilities (date, available, apartment_id)
                     VALUES ($1, $2, $3)`,
                    [date, true, apartmentId]
                );
            });
            await t.batch(insertAvailabilityQueries);
        });
        console.log('Successfully inserted 720 availabilities');
    } catch (error) {
        console.error("Failed to create availabilities:", error);
        throw error;
    }
}

async function getById(apartmentId) {
    try {
        return await db.any(
            `SELECT *
             FROM apartmentAvailabilities
             WHERE apartment_id = $1
             ORDER BY date`,
            [apartmentId]
        );
    } catch (error) {
        console.error("Failed to retrieve availabilities:", error);
        throw error;
    }
}

async function getAllAvailabilities() {
    try {
        return await db.any(
            `SELECT *
             FROM apartmentAvailabilities
             ORDER BY apartment_id, date`
        );
    } catch (error) {
        console.error("Failed to retrieve all availabilities:", error);
        throw error;
    }
}

async function updateAvailabilities(apartmentId, availabilities) {
    try {
        await db.tx(async t => {
            const updateQueries = availabilities.map(({date, available}) => {
                return t.none(
                    `UPDATE apartmentAvailabilities
                     SET available = $1
                     WHERE apartment_id = $2
                       AND date = $3`,
                    [available, apartmentId, date]
                );
            });
            await t.batch(updateQueries);
        });
        console.log('Successfully updated availabilities');
    } catch (error) {
        console.error("Failed to update availabilities:", error);
        throw error;
    }
}

async function deleteAvailabilitiesByApartmentId(apartmentId) {
    try {
        await db.none(
            `DELETE
             FROM apartmentAvailabilities
             WHERE apartment_id = $1`,
            [apartmentId]
        );
        console.log(`Successfully deleted availabilities for apartment_id ${apartmentId}`);
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
    deleteAvailabilitiesByApartmentId
};
