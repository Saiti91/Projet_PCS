const db = require("../common/db_handler");
const generateDates = require('../common/middlewares/generateDate');

async function createAvailabilities(apartmentId) {
    const dates = generateDates(360); // Generate 360 dates from today
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
        console.log('Successfully inserted 360 availabilities');
    } catch (error) {
        console.error("Failed to create availabilities:", error);
        throw error;
    }
}

async function getByApartmentId(apartmentId) {
    if (!apartmentId) {
        throw new Error("Apartment ID is required.");
    }
    try {
        const calendarQuery = `
            SELECT json_build_object('available', appartCalendar.available, 'date', appartCalendar.date) AS entry
            FROM apartmentAvailabilities appartCalendar
            WHERE appartCalendar.apartment_id = $1
              AND appartCalendar.available = false
            ORDER BY appartCalendar.date;
        `;
        const calendarEntries = await db.any(calendarQuery, [apartmentId]);
        return calendarEntries.map(row => row.entry);
    } catch (error) {
        console.error(`Failed to retrieve calendar for apartment ID ${apartmentId}:`, error);
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

module.exports = {
    createAvailabilities,
    getById: getByApartmentId,
    getAllAvailabilities,
    updateAvailabilities,
    deleteAvailabilitiesByApartmentId
};
