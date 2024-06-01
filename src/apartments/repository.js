// Importation du gestionnaire de base de données
const db = require("../common/db_handler");
const calendar = require("../calendar/repository");

async function createOne(apartment) {
    // Retrieve the owner_id from the users table using the ownerEmail
    const owner = await db.oneOrNone("SELECT users_id FROM users WHERE email=$1", [apartment.ownerEmail]);

    // If no user is found with the provided email, throw an error
    if (!owner) {
        throw new Error("No user found with the provided email.");
    }

    // Add the owner_id to the apartment object
    apartment.owner_id = owner.users_id;

    // Remove the ownerEmail from the apartment object
    delete apartment.ownerEmail;

    // Create a string with the keys of the apartment object
    const attributesString = Object.keys(apartment).join(",");
    // Create a string of values, prepared for a secure SQL insertion
    const valuesString = Object.keys(apartment)
        .map(k => `$<${k}>`)
        .join(",");

    try {
        // Execute the SQL query to insert the data and return the ID of the created apartment
        const newApartment = await db.one(
            `INSERT INTO apartments(${attributesString}) VALUES(${valuesString}) RETURNING apartments_id, owner_id;`,
            apartment
        );

        // Return the new apartment
        return newApartment;
    } catch (error) {
        console.error("Failed to create apartment:", error);
        throw error; // Rethrow the error for higher management
    }
}
// Fonction asynchrone pour récupérer un emplacement spécifique par son ID
async function getOne(id) {
    // Exécution de la requête SQL pour récupérer un emplacement par son ID
    return await db.oneOrNone("SELECT * FROM apartments WHERE apartments_id=${id}", { id });
}

// async function createCalendar(idApartment, idOwner) {
//     const query = `INSERT INTO apartmentavailabilities (available, date, owner_id, apartments_id)
//         SELECT true, gs.date, $1 as owner_id, $2 as apartments_id
//         FROM generate_series(current_date, current_date + interval '2 years', '1 day') as gs(date)`;
//
//     try {
//         await db.none(query, [idOwner, idApartment]);
//         return { success: true, message: "calendar created for two years." };
//     } catch (error) {
//         console.error("Error creating calendar:", error);
//         return { success: false, message: error.message };
//     }
// }

// Fonction asynchrone pour récupérer tous les emplacements
async function getAll() {
    // Execute the SQL query to get all locations
    const res = await db.manyOrNone(`
        SELECT apartments.apartments_id, apartments.created_at, apartments.surface, apartments.address,
               apartments.capacity, apartments.apartmentstype, apartments.garden, apartments.roomnumber,
               apartments.pool, apartments.price, apartments.available, users.email AS owner_email
        FROM apartments
        JOIN users ON apartments.owner_id = users.users_id
    `);

    // Return an empty array if no location is found
    if (!res) {
        return [];
    }

    // Return the list of found locations
    return res;
}

// Fonction asynchrone pour mettre à jour un emplacement spécifique
async function updateOne(id, apartment) {
    // Création d'une chaîne de caractères pour la mise à jour des attributs
    const attrsStr = Object.keys(apartment)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    // Exécution de la requête SQL pour mettre à jour l'emplacement et retourner l'objet modifié
    const modified = await db.oneOrNone(
        `UPDATE apartments SET ${attrsStr} WHERE apartments_id = ${id} RETURNING *;`,
        { id, ...apartment }
    );

    // Retourne l'emplacement modifié
    return modified;
}

// Fonction asynchrone pour supprimer un emplacement par son ID
async function deleteOne(id) {
    // Exécution de la requête SQL pour supprimer l'emplacement et retourner l'ID supprimé
    return await db.oneOrNone(
        "DELETE FROM apartments WHERE apartments_id=${id} RETURNING apartments_id;",
        { id }
    );
}

// Exportation des fonctions pour utilisation dans d'autres parties du code
module.exports = { createOne, getOne, getAll, updateOne, deleteOne, };
