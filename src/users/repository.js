const db = require("../common/db_handler");

//création d'un utilisateur
async function createOne(location) {
    //Sépare les attribut de l'objet
    const attributesString = Object.keys(location).join(",");
    //Crée une string avec cet objet séparer
    const valuesString = Object.keys(location)
        .map((k) => `$<${k}>`)
        .join(",");

    return await db.one(
        `INSERT INTO users(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
        location
    );
}

//Récupère un utilisateur en fonction de son ID
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM users WHERE id=${id}", { id });
}

//Récupère un ou plusieurs utilisateur en fonction d'un attribut
async function getOneBy(attribute, value) {
    return await db.oneOrNone(
        `SELECT * FROM users WHERE ${attribute} = $<value>`,
        { value }
    );
}

//Récupère tous les utilisateurs
async function getAll() {
    const res = await db.manyOrNone("SELECT * FROM users");
    return res || [];
}

//Update un utilisateur
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

//Délete un user par son ID
async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM users WHERE id=${id} RETURNING id;", { id });
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne, getOneBy };
