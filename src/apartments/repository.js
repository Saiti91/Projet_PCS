//apartments/repository.js
const db = require("../common/db_handler");
const calendar = require("../apartmentCalendar/repository");

async function createOne(apartment) {
    const {address} = apartment;

    if (!apartment.ownerEmail) {
        throw new Error("Owner email is required.");
    }

    if (!address || !address.street || !address.town) {
        throw new Error("Address information is incomplete.");
    }

    const owner = await db.oneOrNone("SELECT users_id FROM users WHERE email=$1", [apartment.ownerEmail]);
    if (!owner) {
        throw new Error("No user found with the provided email.");
    }
    apartment.owner_id = owner.users_id;

    delete apartment.imagePaths;
    delete apartment.address;
    delete apartment.ownerEmail;

    try {
        return await db.tx(async t => {
            const newAddress = await t.one(
                `INSERT INTO address (longitude, latitude, number, addressComplement, building, apartmentNumber, street,
                                      CP, town)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING address_id`,
                [address.longitude, address.latitude, address.number, address.addressComplement, address.building, address.apartmentNumber, address.street, address.CP, address.town]
            );
            apartment.address_id = newAddress.address_id;

            const attributesString = Object.keys(apartment).join(",");
            const valuesString = Object.keys(apartment).map((_, i) => `$${i + 1}`).join(",");
            const apartmentValues = Object.values(apartment);
            return await t.one(
                `INSERT INTO apartments(${attributesString})
                 VALUES (${valuesString})
                 RETURNING apartments_id;`,
                apartmentValues
            );
        });
    } catch (error) {
        console.error("Failed to create apartment:", error);

        await resetPrimaryKeySequence('address', 'address_id');
        await resetPrimaryKeySequence('apartments', 'apartments_id');

        throw new Error("Failed to create apartment.");
    }
}

async function saveImagePaths(apartmentId, imagePaths, t) {
    try {
        const insertImageQueries = imagePaths.map(path => {
            return t.none(
                `INSERT INTO apartmentsImage(apartment_id, path)
                 VALUES ($1, $2)`,
                [apartmentId, path]
            );
        });
        await t.batch(insertImageQueries);
    } catch (error) {
        console.error("Failed to save image paths:", error);
        throw new Error("Failed to save image paths.");
    }
}

async function resetPrimaryKeySequence(tableName, primaryKeyColumn) {
    const sequenceName = `${tableName}_${primaryKeyColumn}_seq`;
    const query = `
        SELECT setval('${sequenceName}', COALESCE((SELECT MAX(${primaryKeyColumn}) FROM ${tableName}) + 1, 1), false);
    `;
    try {
        await db.none(query);
        console.log(`Sequence ${sequenceName} has been reset.`);
    } catch (error) {
        console.error(`Failed to reset sequence ${sequenceName}:`, error);
    }
}

async function createCalendarForApartment(apartmentId, t) {
    if (!apartmentId) {
        throw new Error("Apartment ID is required.");
    }

    try {
        return await calendar.createAvailabilities(apartmentId, t);
    } catch (error) {
        console.error("Failed to create calendar:", error);
        throw new Error("Failed to create calendar.");
    }
}

async function getApartmentTypeIdByName(name) {
    const result = await db.oneOrNone("SELECT apartmentsTypes_id FROM apartmentsTypes WHERE name = $1", [name]);
    if (!result) {
        throw new Error(`Apartment type with name "${name}" not found.`);
    }
    return result.apartmentstypes_id;
}

async function getApartmentTypes() {
    const result = await db.manyOrNone("SELECT * FROM apartmentsTypes");
    if (!result) {
        throw new Error("No apartment types found.");
    }
    return result;
}

async function getApartmentFeatures() {
    const result = await db.manyOrNone("SELECT * FROM apartmentFeatures");
    if (!result) {
        throw new Error("No apartment features found.");
    }
    return result;
}

async function getOne(id) {
    if (!id) {
        throw new Error("Apartment ID is required.");
    }

    try {
        const apartmentQuery = `
            SELECT a.apartments_id,
                   a.name,
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
                   at.name                                               AS apartment_type,
                   a.numberOfRoom,
                   a.price,
                   ARRAY_AGG(DISTINCT ai.path)                           AS images,
                   ARRAY_AGG(DISTINCT af.name)                           AS features,
                   u.email                                               AS owner_email,
                   JSON_AGG(appartCalendar ORDER BY appartCalendar.date) AS calendar
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
                 apartmentsTypes at
                 ON a.apartmentsType_id = at.apartmentsTypes_id
                     LEFT JOIN
                 apartmentAvailabilities appartCalendar ON a.apartments_id = appartCalendar.apartment_id
            WHERE a.apartments_id = $1
            GROUP BY a.apartments_id, addr.street, addr.building, addr.apartmentNumber, addr.number,
                     addr.addressComplement, addr.CP, addr.town, at.name, u.email
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

async function getAll() {
    try {
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
                   a.name,
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
                 apartmentsTypes at
                 ON a.apartmentsType_id = at.apartmentsTypes_id
            GROUP BY a.apartments_id, addr.street, addr.building, addr.apartmentNumber, addr.number,
                     addr.addressComplement, addr.CP, addr.town, at.name, u.email
            LIMIT 100;
        `);

        return apartments || [];
    } catch (error) {
        console.error("Failed to retrieve apartments:", error);
        throw error;
    }
}

async function getCarousel() {
    try {
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
                ) ai
                               ON true
            ORDER BY RANDOM()
            LIMIT 10;
        `);

        return res || [];
    } catch (error) {
        console.error("Failed to retrieve carousel apartments:", error);
        throw error;
    }
}

async function getApartmentImages(apartmentId) {
    if (!apartmentId) {
        throw new Error("Apartment ID is required.");
    }

    try {
        const images = await db.manyOrNone(`
            SELECT ai.path
            FROM apartmentsImage ai
            WHERE ai.apartment_id = $1
            ORDER BY ai.image_id;
        `, [apartmentId]);

        return images || [];
    } catch (error) {
        console.error(`Failed to retrieve images for apartment ID ${apartmentId}:`, error);
        throw error;
    }
}

async function updateOne(id, apartment) {
    if (!id || !apartment) {
        throw new Error("Apartment ID and update data are required.");
    }

    const {address} = apartment;
    delete apartment.address;

    const apartmentAttrsStr = Object.keys(apartment)
        .map((k, index) => `${k} = $${index + 1}`)
        .join(", ");

    const apartmentValues = Object.values(apartment);

    try {
        return await db.tx(async t => {
            if (address) {
                const addressAttrsStr = Object.keys(address)
                    .map((k, index) => `${k} = $${index + 1}`)
                    .join(", ");
                const addressValues = Object.values(address);

                await t.none(
                    `UPDATE address
                     SET ${addressAttrsStr}
                     WHERE address_id =
                           (SELECT address_id FROM apartments WHERE apartments_id = $${addressValues.length + 1})`,
                    [...addressValues, id]
                );
            }

            if (apartmentAttrsStr) {
                await t.none(
                    `UPDATE apartments
                     SET ${apartmentAttrsStr}
                     WHERE apartments_id = $${apartmentValues.length + 1}`,
                    [...apartmentValues, id]
                );
            }

            return await t.oneOrNone(
                `SELECT *
                 FROM apartments
                 WHERE apartments_id = $1`,
                [id]
            );
        });
    } catch (error) {
        console.error(`Failed to update apartment with ID ${id}:`, error);
        throw error;
    }
}

async function deleteOne(id) {
    if (!id) {
        throw new Error("Apartment ID is required.");
    }

    try {
        return await db.oneOrNone(
            "DELETE FROM apartments WHERE apartments_id = $1 RETURNING apartments_id;",
            [id]
        );
    } catch (error) {
        console.error(`Failed to delete apartment with ID ${id}:`, error);
        throw error;
    }
}

module.exports = {
    createOne,
    getOne,
    getAll,
    updateOne,
    deleteOne,
    getCarousel,
    getApartmentTypeIdByName,
    getApartmentImages,
    createCalendarForApartment,
    saveImagePaths,
    getApartmentFeatures,
    getApartmentTypes
};
