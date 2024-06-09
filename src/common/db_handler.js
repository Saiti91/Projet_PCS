const db = require("../common/db_handler");

const createInspection = async (inspection) => {
    const { reservationId, description, photos, type } = inspection;

    return db.tx(async t => {
        const result = await t.one(
            "INSERT INTO inventory (reservation_id, description, type, status) VALUES ($1, $2, $3, 'pending') RETURNING *",
            [reservationId, description, type]
        );

        const inspectionId = result.inventory_id;

        const photoQueries = photos.map(photo =>
            t.none("INSERT INTO inventory_pictures (inventory_id, path) VALUES ($1, $2)", [inspectionId, photo])
        );

        await t.batch(photoQueries);

        return result;
    });
};

const updateInspection = async (inspectionId, updates) => {
    const { comments, photos, status } = updates;

    return db.tx(async t => {
        await t.none(
            "UPDATE inventory SET comments = $1, status = $2 WHERE inventory_id = $3",
            [comments, status, inspectionId]
        );

        if (photos && photos.length > 0) {
            const photoQueries = photos.map(photo =>
                t.none("INSERT INTO inventory_pictures (inventory_id, path) VALUES ($1, $2)", [inspectionId, photo])
            );

            await t.batch(photoQueries);
        }

        return await t.one("SELECT * FROM inventory WHERE inventory_id = $1", [inspectionId]);
    });
};

const getInspectionById = async (inspectionId) => {
    return db.oneOrNone("SELECT * FROM inventory WHERE inventory_id = $1", [inspectionId]);
};

module.exports = {
    createInspection,
    updateInspection,
    getInspectionById,
};
