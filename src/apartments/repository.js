// Importation du gestionnaire de base de données
const db = require("../common/db_handler");
const calendar = require("../apartmentCalendar/repository");

async function createOne(apartment) {
    const {imagePaths} = apartment;
    delete apartment.imagePaths;

    const owner = await db.oneOrNone("SELECT users_id FROM users WHERE email=$1", [apartment.ownerEmail]);
    if (!owner) {
        throw new Error("No user found with the provided email.");
    }
    delete apartment.ownerEmail;

    const attributesString = Object.keys(apartment).join(",");
    const valuesString = Object.keys(apartment)
        .map(k => `$<${k}>`)
        .join(",");

    try {
        return await db.tx(async t => {
            const newApartment = await t.one(
                `INSERT INTO apartments(${attributesString})
                 VALUES (${valuesString})
                 RETURNING apartments_id, owner_id;`,
                apartment
            );

            // Insert the image paths
            if (imagePaths && imagePaths.length > 0) {
                const insertImageQueries = imagePaths.map(path => {
                    return t.none(
                        `INSERT INTO apartmentsImage(apartment_id, path)
                         VALUES ($1, $2)`,
                        [newApartment.apartments_id, path]
                    );
                });

                await t.batch(insertImageQueries);
            }
            await calendar.createAvailabilities(newApartment.apartments_id);

            return newApartment;
        });
    } catch (error) {
        console.error("Failed to create apartment:", error);
        throw error;
    }
}

// Fonction asynchrone pour récupérer un emplacement spécifique par son ID
async function getOne(id) {
    try {
        const apartmentQuery = `
            SELECT aparts.*,
                   ARRAY_AGG(apartImage.path)                            AS images,
                   JSON_AGG(appartCalendar ORDER BY appartCalendar.date) AS calendar
            FROM apartments aparts
                     LEFT JOIN
                 apartmentsImage apartImage ON aparts.apartments_id = apartImage.apartment_id
                     LEFT JOIN
                 apartmentAvailabilities appartCalendar ON aparts.apartments_id = appartCalendar.apartment_id
            WHERE aparts.apartments_id = $1
            GROUP BY aparts.apartments_id
        `;

        const apartment = await db.oneOrNone(apartmentQuery, [id]);

        if (!apartment) {
            throw new Error(`No apartment found with ID ${id}`);
        }

        return apartment;
    } catch (error) {
        console.error(`Failed to retrieve apartment with ID ${id}:`, error);
        throw error;
    }
}

//TODO: Restructure request

async function getAll() {
    try {
        // Exécuter la requête SQL pour obtenir tous les appartements avec les informations de l'adresse,
        // du type d'appartement, des caractéristiques et des images
        const apartments = await db.manyOrNone(`
            SELECT a.apartments_id,
                   a.created_at,
                   a.surface,
                   addr.street,
                   addr.building,
                   addr.apartmentNumber,
                   addr.number,
                   addr.addressComplement,
                   addr.CP,
                   addr.town,
                   a.capacity,
                   a.apartmentsType_id,
                   at.name                     AS apartment_type,
                   a.numberOfRoom,
                   a.price,
                   ARRAY_AGG(DISTINCT ai.path) AS images,
                   ARRAY_AGG(DISTINCT af.name) AS features,
                   u.email                     AS owner_email
            FROM apartments a
                     JOIN
                 address addr ON a.address_id = addr.address_id
                     JOIN
                 users u ON a.owner_id = u.users_id
                     LEFT JOIN
                 apartmentsImage ai ON a.apartments_id = ai.apartment_id
                     LEFT JOIN
                 apartmentToFeatures atf ON a.apartments_id = atf.apartment_id
                     LEFT JOIN
                 apartmentFeatures af ON atf.feature_id = af.feature_id
                     LEFT JOIN
                 apartmentsTypes at ON a.apartmentsType_id = at.apartmentsTypes_id
            GROUP BY a.apartments_id, addr.street, addr.building, addr.apartmentNumber, addr.number,
                     addr.addressComplement, addr.CP, addr.town, at.name, u.email
        `);

        // Retourner la liste des appartements trouvés ou un tableau vide si aucun appartement n'est trouvé
        return apartments || [];
    } catch (error) {
        console.error("Failed to retrieve apartments:", error);
        throw error;
    }
}

async function getCarousel() {
    try {
        // Exécuter la requête SQL pour obtenir un carrousel d'appartements aléatoires avec la première image de chaque appartement
        const res = await db.manyOrNone(`
            SELECT a.apartments_id,
                   a.name,
                   ai.path AS image_path,
                   addr.town
            FROM apartments a
                     JOIN
                 address addr ON a.address_id = addr.address_id
                     LEFT JOIN LATERAL (
                SELECT path
                FROM apartmentsImage ai
                WHERE ai.apartment_id = a.apartments_id
                ORDER BY ai.image_id
                LIMIT 1
                ) ai ON true
            ORDER BY RANDOM()
            LIMIT 10;
        `);

        // Retourner un tableau vide si aucun appartement n'est trouvé
        if (!res) {
            return [];
        }

        // Retourner la liste des appartements trouvés
        return res;
    } catch (error) {
        console.error("Failed to retrieve carousel apartments:", error);
        throw error;
    }
}


// Fonction asynchrone pour mettre à jour un emplacement spécifique
async function updateOne(id, apartment) {
    // Création d'une chaîne de caractères pour la mise à jour des attributs
    const attrsStr = Object.keys(apartment)
        .map((k, index) => `${k} = $${index + 1}`)
        .join(", ");

    // Préparer les valeurs pour les paramètres SQL
    const values = Object.values(apartment);

    try {
        // Exécution de la requête SQL pour mettre à jour l'emplacement et retourner l'objet modifié
        const modified = await db.oneOrNone(
            `UPDATE apartments
             SET ${attrsStr}
             WHERE apartments_id = $${values.length + 1} RETURNING *;`, [...values, id]);

        // Retourne l'emplacement modifié ou null si aucun appartement n'a été modifié
        return modified;
    } catch (error) {
        console.error(`Failed to update apartment with ID ${id}:`, error);
        throw error;
    }
}
// Fonction asynchrone pour supprimer un emplacement par son ID
async function deleteOne(id) {
    try {
        // Exécution de la requête SQL pour supprimer l'emplacement et retourner l'ID supprimé
        // Retourner l'ID supprimé ou null si aucun appartement n'a été supprimé
        return await db.oneOrNone(
            "DELETE FROM apartments WHERE apartments_id = $1 RETURNING apartments_id;",
            [id]
        );
    } catch (error) {
        console.error(`Failed to delete apartment with ID ${id}:`, error);
        throw error;
    }
}

// Exportation des fonctions pour utilisation dans d'autres parties du code
module.exports = {createOne, getOne, getAll, updateOne, deleteOne, getCarousel};
