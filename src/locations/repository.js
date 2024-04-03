const db = require("../common/db_handler");

async function createOne(location) {
    const attributesString = Object.keys(location).join(",");
    const valuesString = Object.keys(location)
        .map((k) => `$<${k}>`)
        .join(",");

    return await db.one(
        `INSERT INTO locations(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
        location
    );
}

async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM locations WHERE id=${id}", { id });
}

async function getAll() {
    const res = await db.manyOrNone("SELECT * FROM locations");

    if (!res) {
        return [];
    }

    return res;
}

async function updateOne(id, location) {
    const attrsStr = Object.keys(location)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    const modified = await db.oneOrNone(
        `UPDATE locations SET ${attrsStr} WHERE id = $<id> RETURNING *;`,
        { id, ...location }
    );

    return modified;
}

async function deleteOne(id) {
    return await db.oneOrNone(
        "DELETE FROM locations WHERE id=${id} RETURNING id;",
        { id }
    );
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
