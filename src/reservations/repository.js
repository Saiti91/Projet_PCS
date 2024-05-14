// Importation du gestionnaire de base de données
const db =require   ("../common/db_handler");

// Fonction asynchrone pour créer une nouvelle entrée de réservation dans la base de données
async function createOne(location) {
    // Création d'une chaîne de caractères avec les clés de l'objet location
    const attributesString = Object.keys(location).join(",");
    // Création d'une chaîne de caractères pour les valeurs, préparées pour l'insertion SQL sécurisée
    const valuesString = Object.keys(location)
        .map((k) => `$<${k}>`)
        .join(",");

    // Exécution de la requête SQL pour insérer les données et retourner l'entrée créée
    return await db.one(
        `INSERT INTO reservations(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
        location
    );
}

// Fonction asynchrone pour récupérer une réservation par son identifiant
async function getOne(id) {
    // Exécution de la requête SQL pour sélectionner une réservation par son id
    return await db.oneOrNone("SELECT * FROM reservations WHERE reservations_id=${id}", {
        id,
    });
}

// Fonction asynchrone pour récupérer toutes les réservations
async function getAll() {
    // Exécution de la requête SQL pour sélectionner toutes les réservations
    const res = await db.manyOrNone("SELECT * FROM reservations");

    // Retourne un tableau vide si aucune réservation n'est trouvée
    if (!res) {
        return [];
    }

    // Retourne les résultats si des réservations sont trouvées
    return res;
}

// Fonction asynchrone pour mettre à jour une réservation existante
async function updateOne(id, reservation) {
    // Création d'une chaîne de caractères pour la mise à jour des attributs de la réservation
    const attrsStr = Object.keys(reservation)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    // Exécution de la requête SQL pour mettre à jour la réservation et retourner l'entrée modifiée
    const modified = await db.oneOrNone(
        `UPDATE reservations SET ${attrsStr} WHERE reservations_id = ${id} RETURNING *;`,
        { id, ...reservation }
    );

    // Retourne l'entrée modifiée
    return modified;
}

// Fonction asynchrone pour supprimer une réservation par son identifiant
async function deleteOne(id) {
    // Exécution de la requête SQL pour supprimer la réservation et retourner l'identifiant supprimé
    return await db.oneOrNone(
        "DELETE FROM reservations WHERE reservations_id=${id} RETURNING reservations_id;",
        {
            id,
        }
    );
}

// Fonction asynchrone pour récupérer des réservations qui se chevauchent avec un intervalle donné
async function getOverlappingReservations(start, end, appartId) {
    // Defining the SQL query
    const query = `
        SELECT * FROM reservations 
        WHERE (
            ($1::DATE = date_start::DATE OR
            date_start::DATE < $1::DATE AND date_end::DATE > $1::DATE OR
            $1::DATE < date_start::DATE AND $2::DATE > date_start::DATE)
        )
        ${appartId ? " AND location = $3" : ""};
    `;

    try {
        // Executing the SQL query with parameters
        return await db.manyOrNone(query, appartId ? [start, end, appartId] : [start, end]);
    } catch (error) {
        console.error("Error fetching overlapping reservations:", error);
        throw error;
    }
}

async function checkAvailability(start, end, appartId) {
    const query = `
        SELECT COUNT(*) FROM generate_series($1::date, $2::date, '1 day') AS g(day)
        LEFT JOIN appartementAvailabilities a ON a.date = g.day AND a.appartement_id = $3
        WHERE a.available IS NOT TRUE OR a.available IS NULL;
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
