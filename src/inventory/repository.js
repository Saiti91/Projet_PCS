const db = require("../common/db_handler");

const createInspection = async (inspection) => {
    const {reservationId, description, photos, type} = inspection;

    const client = await db.connect(); // Connect to the database
    try {
        await client.query('BEGIN'); // Start a transaction

        const result = await client.query(
            "INSERT INTO inventory (reservation_id, description, type, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
            [reservationId, description, type]
        );
        const inspectionId = result.rows[0].inventory_id;

        await Promise.all(
            photos.map(photo =>
                client.query("INSERT INTO inventory_pictures (inventory_id, path) VALUES ($1, $2)", [inspectionId, photo])
            )
        );

        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows[0];
    } catch (e) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        throw e; // Rethrow the error to be handled by the calling function
    } finally {
        client.release(); // Release the database client
    }
};

const updateInspection = async (inspectionId, updates) => {
    const {comments, photos, status} = updates;

    const client = await db.connect(); // Connect to the database
    try {
        await client.query('BEGIN'); // Start a transaction

        await client.query("UPDATE inventory SET comments = $1, status = $2 WHERE inventory_id = $3", [comments, status, inspectionId]);

        if (photos && photos.length > 0) {
            await Promise.all(
                photos.map(photo =>
                    client.query("INSERT INTO inventory_pictures (inventory_id, path) VALUES ($1, $2)", [inspectionId, photo])
                )
            );
        }

        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return await getInspectionById(inspectionId);
    } catch (e) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        throw e; // Rethrow the error to be handled by the calling function
    } finally {
        client.release(); // Release the database client
    }
};

const getInspectionById = async (inspectionId) => {
    const result = await db.query("SELECT * FROM inventory WHERE inventory_id = $1", [inspectionId]);
    return result.rows[0];
};

module.exports = {
    createInspection,
    updateInspection,
    getInspectionById,
};
