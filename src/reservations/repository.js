// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require("../common/db_handler");

// Fonction asynchrone pour créer une nouvelle entrée de réservation dans la base de données
async function createOne(location) {
    const attributesString = Object.keys(location).join(",");
    const valuesString = Object.keys(location).map((_, i) => `$${i + 1}`).join(",");

    const values = Object.values(location);

    return await db.one(
        `INSERT INTO reservations(${attributesString})
         VALUES (${valuesString}) RETURNING *;`,
        values
    );
}

// Fonction asynchrone pour récupérer une réservation par son identifiant
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM reservations WHERE reservations_id=$1", [id]);
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

    const modified = await db.oneOrNone(
        `UPDATE reservations
         SET ${attrsStr}
         WHERE reservations_id = $1 RETURNING *;`,
        values
    );

    return modified;
}

// Fonction asynchrone pour supprimer une réservation par son identifiant
async function deleteOne(id) {
    return await db.oneOrNone(
        "DELETE FROM reservations WHERE reservations_id=$1 RETURNING reservations_id;",
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
async function checkAvailability(start, end, appartId) {
    const query = `
        SELECT COUNT(*)
        FROM generate_series($1::date, $2::date, '1 day') AS g(day)
                 LEFT JOIN apartmentAvailabilities a ON a.date = g.day AND a.apartment_id = $3
        WHERE a.available IS NOT TRUE;
    `;

    try {
        const result = await db.one(query, [start, end, appartId]);
        return parseInt(result.count) === 0; // Retourne vrai si tous les jours sont disponibles
    } catch (error) {
        console.error("Error checking availability:", error);
        throw error;
    }
}

// Exportation des fonctions pour leur utilisation dans d'autres modules
module.exports = {
    createOne,
    getOne,
    getAll,
    getOverlappingReservations,
    updateOne,
    deleteOne,
    checkAvailability,
};
