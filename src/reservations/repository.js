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
    return await db.oneOrNone("SELECT * FROM reservations WHERE id=${id}", {
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
        `UPDATE reservations SET ${attrsStr} WHERE id = $<id> RETURNING *;`,
        { id, ...reservation }
    );

    // Retourne l'entrée modifiée
    return modified;
}

// Fonction asynchrone pour supprimer une réservation par son identifiant
async function deleteOne(id) {
    // Exécution de la requête SQL pour supprimer la réservation et retourner l'identifiant supprimé
    return await db.oneOrNone(
        "DELETE FROM reservations WHERE id=${id} RETURNING id;",
        {
            id,
        }
    );
}

// Fonction asynchrone pour récupérer des réservations qui se chevauchent avec un intervalle donné
async function getOverlappingReservations(start, end, appartId) {
    // Exécution de la requête SQL pour sélectionner les réservations qui se chevauchent avec les dates données
    return await db.manyOrNone(
        `SELECT * FROM reservations WHERE  
    ($<start>::DATE = date_start::DATE OR
          (date_start::date < $<start>::date AND date_end::date > $<start>::date) OR
          ($<start>::date < date_start::date AND $<end>::date > date_start::date)
    ) 
    ${appartId && false ? " AND location = $<appartId> " : ""};
    `,
        {
            start: start,
            end: end,
            appartId,
        }
    );
}

// Exportation des fonctions pour leur utilisation dans d'autres modules
module.exports = {
    createOne,
    getOne,
    getAll,
    getOverlappingReservations,
    updateOne,
    deleteOne,
};
