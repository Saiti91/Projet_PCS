// server.js
const db = require("../common/db_handler");

// Fonction asynchrone pour créer une nouvelle entrée de réservation dans la base de données
async function createOne(reservation, services) {
    const attributesString = Object.keys(reservation).join(",");
    const valuesString = Object.keys(reservation).map((_, i) => `$${i + 1}`).join(",");
    const values = Object.values(reservation);

    console.log("values", values);
    const client = await db.connect();

    try {
        await client.query('BEGIN');
        const newReservation = await client.one(
            `INSERT INTO reservations(${attributesString})
             VALUES (${valuesString})
             RETURNING *;`,
            values
        );

        for (const service of services) {
            const { serviceType_id, serviceProvider_id } = service;
            await client.none(
                `INSERT INTO reservation_services (reservation_id, serviceType_id, serviceProvider_id)
                 VALUES ($1, $2, $3);`,
                [newReservation.reservation_id, serviceType_id, serviceProvider_id]
            );
        }

        await client.query('COMMIT');
        return newReservation;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        if (client.release) {
            client.release();
        }
    }
}

// Fonction asynchrone pour récupérer une réservation par son identifiant
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM reservations WHERE reservation_id=$1", [id]);
}

// Fonction asynchrone pour récupérer une réservation par son identifiant
async function getUserOne(id) {
    return await db.manyOrNone("SELECT * FROM reservations WHERE users_id=$1", [id]);
}

// Fonction asynchrone pour récupérer toutes les réservations
async function getAll() {
    const res = await db.manyOrNone("SELECT * FROM reservations");
    return res || [];
}

// Fonction asynchrone pour mettre à jour une réservation existante
async function updateOne(id, reservation) {
    const attrsStr = Object.keys(reservation).map((k, i) => `${k} = $${i + 2}`).join(",");
    const values = [id, ...Object.values(reservation)];

    return await db.oneOrNone(
        `UPDATE reservations
         SET ${attrsStr}
         WHERE reservation_id = $1
         RETURNING *;`,
        values
    );
}

// Fonction asynchrone pour supprimer une réservation par son identifiant
async function deleteOne(id) {
    return await db.oneOrNone(
        "DELETE FROM reservations WHERE reservation_id=$1 RETURNING reservation_id;",
        [id]
    );
}

// Fonction asynchrone pour récupérer des réservations qui se chevauchent avec un intervalle donné
async function getOverlappingReservations(start, end, appartId) {
    const query = `
        SELECT *
        FROM reservations
        WHERE (
                  ($1::DATE = date_start::DATE OR
                   date_start::DATE < $1::DATE AND date_end::DATE > $1::DATE OR
                   $1::DATE < date_start::DATE AND $2::DATE > date_start::DATE)
                  )
            ${appartId ? " AND apartment_id = $3" : ""};
    `;

    try {
        return await db.manyOrNone(query, appartId ? [start, end, appartId] : [start, end]);
    } catch (error) {
        console.error("Error fetching overlapping reservations:", error);
        throw error;
    }
}

// Fonction asynchrone pour vérifier la disponibilité d'un appartement
async function checkAvailabilityUnavailable(start, end, appartId) {
    const query = `
        SELECT COUNT(*)
        FROM generate_series($1::date, $2::date, '1 day') AS g(day)
                 LEFT JOIN apartmentAvailabilities a ON a.date = g.day AND a.apartment_id = $3
        WHERE a.status_id = (SELECT id FROM availability_status WHERE status_name = 'unavailable');
    `;

    try {
        const result = await db.one(query, [start, end, appartId]);
        return parseInt(result.count) === 0; // Retourne vrai si tous les jours sont disponibles
    } catch (error) {
        console.error("Error checking availability:", error);
        throw error;
    }
}

async function checkAvailabilityReserved(start, end, appartId) {
    const query = `
        SELECT COUNT(a.date) AS reserved_count
        FROM generate_series($1::date, $2::date, '1 day') AS g(day)
                 LEFT JOIN apartmentAvailabilities a
                           ON a.date = g.day AND a.apartment_id = $3
        WHERE a.status_id = (SELECT id FROM availability_status WHERE status_name = 'reserved');
    `;

    try {
        const result = await db.one(query, [start, end, appartId]);
        return parseInt(result.reserved_count) === 0; // Returns true if all days are available, false otherwise
    } catch (error) {
        console.error("Error checking availability:", error);
        throw error;
    }
}

module.exports = {
    createOne,
    getOne,
    getAll,
    getOverlappingReservations,
    updateOne,
    deleteOne,
    checkAvailability: checkAvailabilityUnavailable,
    getUserOne,
    checkAvailabilityReserved
};
