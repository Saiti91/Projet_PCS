// Importation du gestionnaire de base de données
const db = require("../common/db_handler");

// Fonction asynchrone pour créer un nouvel emplacement
// async function createOne(appartement) {
//     // Création d'une chaîne de caractères avec les clés de l'objet appartement
//     const attributesString = Object.keys(appartement).join(",");
//     // Création d'une chaîne de valeurs, préparées pour une insertion SQL sécurisée
//     const valuesString = Object.keys(appartement)
//         .map((k) => `$<${k}>`)
//         .join(",");
//
//     // Exécution de la requête SQL pour insérer les données et retourner l'objet créé
//     return await db.one(
//         `INSERT INTO appartements(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
//         appartement
//     );
// }
async function createOne(appartement) {
    // Création d'une chaîne de caractères avec les clés de l'objet appartement
    const attributesString = Object.keys(appartement).join(",");
    // Création d'une chaîne de valeurs, préparées pour une insertion SQL sécurisée
    const valuesString = Object.keys(appartement)
        .map(k => `$<${k}>`)
        .join(",");

    try {
        // Exécution de la requête SQL pour insérer les données et retourner l'ID de l'appartement créé
        const newAppartement = await db.one(
            `INSERT INTO appartements(${attributesString}) VALUES(${valuesString}) RETURNING appartements_id, owner_id;`,
            appartement
        );

        // Vérification que l'idOwner est fourni et utilisation de l'idAppartement retourné pour appeler createCalendar
        if (newAppartement.owner_id) {
            await createCalendar(newAppartement.appartement_id, newAppartement.owner_id);
        }

        // Retourner le nouvel appartement après la création du calendrier
        return newAppartement;
    } catch (error) {
        console.error("Failed to create appartement:", error);
        throw error; // Relancer l'erreur pour une gestion plus haute
    }
}


// Fonction asynchrone pour récupérer un emplacement spécifique par son ID
async function getOne(id) {
    // Exécution de la requête SQL pour récupérer un emplacement par son ID
    return await db.oneOrNone("SELECT * FROM appartements WHERE appartements_id=${id}", { id });
}

async function createCalendar(idAppartement, idOwner) {
    const query = `INSERT INTO appartementAvailabilities (available, date, owner_id, appartement_id)
        SELECT true, gs.date, $1 as owner_id, $2 as appartement_id
        FROM generate_series(current_date, current_date + interval '2 years', '1 day') as gs(date)`;

    try {
        await db.none(query, [idOwner, idAppartement]);
        return { success: true, message: "calendar created for two years." };
    } catch (error) {
        console.error("Error creating calendar:", error);
        return { success: false, message: error.message };
    }
}

async function createProviderCalendar(providerId) {
    // Requête SQL pour insérer les disponibilités pour le provider
    const query = `
        INSERT INTO providerAvailabilities (available, date, provider_id)
        SELECT true, gs.date, $1 as provider_id
        FROM generate_series(current_date, current_date + interval '2 years', '1 day') as gs(date)`;

    try {
        // Exécuter la requête avec l'identifiant du provider
        await db.none(query, [providerId]);
        return { success: true, message: "calendar created for provider for two years." };
    } catch (error) {
        console.error("Error creating calendar for provider:", error);
        return { success: false, message: error.message };
    }
}


// Fonction asynchrone pour récupérer tous les emplacements
async function getAll() {
    // Exécution de la requête SQL pour récupérer tous les emplacements
    const res = await db.manyOrNone("SELECT * FROM appartements");

    // Retourne un tableau vide si aucun emplacement n'est trouvé
    if (!res) {
        return [];
    }

    // Retourne la liste des emplacements trouvés
    return res;
}

// Fonction asynchrone pour mettre à jour un emplacement spécifique
async function updateOne(id, appartement) {
    // Création d'une chaîne de caractères pour la mise à jour des attributs
    const attrsStr = Object.keys(appartement)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    // Exécution de la requête SQL pour mettre à jour l'emplacement et retourner l'objet modifié
    const modified = await db.oneOrNone(
        `UPDATE appartements SET ${attrsStr} WHERE appartements_id = ${id} RETURNING *;`,
        { id, ...appartement }
    );

    // Retourne l'emplacement modifié
    return modified;
}

// Fonction asynchrone pour supprimer un emplacement par son ID
async function deleteOne(id) {
    // Exécution de la requête SQL pour supprimer l'emplacement et retourner l'ID supprimé
    return await db.oneOrNone(
        "DELETE FROM appartements WHERE appartements_id=${id} RETURNING appartements_id;",
        { id }
    );
}

// Exportation des fonctions pour utilisation dans d'autres parties du code
module.exports = { createOne, getOne, getAll, updateOne, deleteOne,createCalendar,createProviderCalendar, };
