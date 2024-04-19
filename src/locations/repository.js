// Importation du gestionnaire de base de données
const db = require("../common/db_handler");

// Fonction asynchrone pour créer un nouvel emplacement
async function createOne(location) {
    // Création d'une chaîne de caractères avec les clés de l'objet location
    const attributesString = Object.keys(location).join(",");
    // Création d'une chaîne de valeurs, préparées pour une insertion SQL sécurisée
    const valuesString = Object.keys(location)
        .map((k) => `$<${k}>`)
        .join(",");

    // Exécution de la requête SQL pour insérer les données et retourner l'objet créé
    return await db.one(
        `INSERT INTO locations(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
        location
    );
}

// Fonction asynchrone pour récupérer un emplacement spécifique par son ID
async function getOne(id) {
    // Exécution de la requête SQL pour récupérer un emplacement par son ID
    return await db.oneOrNone("SELECT * FROM locations WHERE id=${id}", { id });
}

// Fonction asynchrone pour récupérer tous les emplacements
async function getAll() {
    // Exécution de la requête SQL pour récupérer tous les emplacements
    const res = await db.manyOrNone("SELECT * FROM locations");

    // Retourne un tableau vide si aucun emplacement n'est trouvé
    if (!res) {
        return [];
    }

    // Retourne la liste des emplacements trouvés
    return res;
}

// Fonction asynchrone pour mettre à jour un emplacement spécifique
async function updateOne(id, location) {
    // Création d'une chaîne de caractères pour la mise à jour des attributs
    const attrsStr = Object.keys(location)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    // Exécution de la requête SQL pour mettre à jour l'emplacement et retourner l'objet modifié
    const modified = await db.oneOrNone(
        `UPDATE locations SET ${attrsStr} WHERE id = $<id> RETURNING *;`,
        { id, ...location }
    );

    // Retourne l'emplacement modifié
    return modified;
}

// Fonction asynchrone pour supprimer un emplacement par son ID
async function deleteOne(id) {
    // Exécution de la requête SQL pour supprimer l'emplacement et retourner l'ID supprimé
    return await db.oneOrNone(
        "DELETE FROM locations WHERE id=${id} RETURNING id;",
        { id }
    );
}

// Exportation des fonctions pour utilisation dans d'autres parties du code
module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
