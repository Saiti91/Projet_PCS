const db = require("../common/db_handler");

async function createOne(location) {
    const attributesString = Object.keys(location).join(",");
    const valuesString = Object.keys(location)
        .map((k) => `$<${k}>`)
        .join(",");

    return await db.one(
        `INSERT INTO users(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
        location
    );
}

async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM users WHERE id=${id}", { id });
}

async function getOneBy(attribute, value) {
    return await db.oneOrNone(
        `SELECT * FROM users WHERE ${attribute} = $<value>`,
        { value }
    );
}

async function getAll() {
    const res = await db.manyOrNone("SELECT * FROM users");
    return res || [];
}

async function updateOne(id, user) {
    const attrsStr = Object.keys(user)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    const modified = await db.oneOrNone(
        `UPDATE users SET ${attrsStr} WHERE id = $<id> RETURNING *;`,
        { id, ...user }
    );

    return modified;
}

async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM users WHERE id=${id} RETURNING id;", { id });
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne, getOneBy };
