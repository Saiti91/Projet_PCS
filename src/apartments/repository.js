const db = require("../common/db_handler");
const calendar = require("../apartmentCalendar/repository");

async function createOne(apartment) {
    const { imagePaths, address } = apartment;

    if (!apartment.ownerEmail) {
        throw new Error("Owner email is required.");
    }

    if (!address || !address.street || !address.town) {
        throw new Error("Address information is incomplete.");
    }

    delete apartment.imagePaths;
    delete apartment.address;

    const owner = await db.oneOrNone("SELECT users_id FROM users WHERE email=$1", [apartment.ownerEmail]);
    if (!owner) {
        throw new Error("No user found with the provided email.");
    }
    delete apartment.ownerEmail;
    apartment.owner_id = owner.users_id;

    try {
        return await db.tx(async t => {
            const newAddress = await t.one(
                `INSERT INTO address (longitude, latitude, number, addressComplement, building, apartmentNumber, street, CP, town)
                 VALUES ($<longitude>, $<latitude>, $<number>, $<addressComplement>, $<building>, $<apartmentNumber>, $<street>, $<CP>, $<town>)
                     RETURNING address_id`,
                address
            );

            apartment.address_id = newAddress.address_id;
            console.log(apartment.address_id);
            const attributesString = Object.keys(apartment).join(",");
            const valuesString = Object.keys(apartment)
                .map(k => `$<${k}>`)
                .join(",");

            const newApartment = await t.one(
                `INSERT INTO apartments(${attributesString})
                 VALUES (${valuesString})
                     RETURNING apartments_id, owner_id;`,
                apartment
            );
            console.log(newApartment.apartments_id);
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
        throw new Error("Failed to create apartment.");
    }
}

async function getApartmentTypeIdByName(name) {
    return db.oneOrNone("SELECT apartmentsTypes_id FROM apartmentsTypes WHERE name = $1", [name]);
}

// Fonction asynchrone pour récupérer un emplacement spécifique par son ID
async function getOne(id) {
    if (!id) {
        throw new Error("Apartment ID is required.");
    }

    try {
        const apartmentQuery = `
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
                   u.email                     AS owner_email,
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
                 apartmentsTypes at ON a.apartmentsType_id = at.apartmentsTypes_id
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
                ) ai ON true
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

    const { address } = apartment;
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
                     WHERE address_id = (SELECT address_id FROM apartments WHERE apartments_id = $${addressValues.length + 1})`,
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

            const updatedApartment = await t.oneOrNone(
                `SELECT * FROM apartments WHERE apartments_id = $1`,
                [id]
            );

            return updatedApartment;
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

module.exports = { createOne, getOne, getAll, updateOne, deleteOne, getCarousel,getApartmentTypeIdByName, getApartmentImages };
