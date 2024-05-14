const db = require("../common/db_handler");

//création d'un service
async function createOne(service) {
    //Sépare les attributs de l'objet
    const attributesString = Object.keys(service).join(",");
    //Crée une string avec cet objet séparé
    const valuesString = Object.keys(service)
        .map((k) => `$<${k}>`)
        .join(",");

    return await db.one(
        `INSERT INTO services(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
        service
    );
}

//Récupère un service en fonction de son ID
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM services WHERE services_id=${id}", { id });
}

//Récupère un ou plusieurs services en fonction d'un attribut
async function getOneBy(attribute, value) {
    return await db.oneOrNone(
        `SELECT * FROM services WHERE ${attribute} = ${value}`,
        { value }
    );
}


async function getAppartementById(id) {
    try {
        const result = await db.oneOrNone('SELECT latitude, longitude FROM appartements WHERE appartements_id = $1', [id]);
        return result;
    } catch (error) {
        console.error("Error fetching appartement details:", error);
        throw error;
    }
}

//Récupère tous les services
async function getAll() {
    const res = await db.manyOrNone("SELECT * FROM services");
    return res || [];
}

//Update un utilisateur
async function updateOne(id, user) {
    const attrsStr = Object.keys(user)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    const modified = await db.oneOrNone(
        `UPDATE services SET ${attrsStr} WHERE services_id = ${id} RETURNING *;`,
        { id, ...user }
    );

    return modified;
}

//Délete un user par son ID
async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM services WHERE services_id=${id} RETURNING services_id;", { id });
}

module.exports = { createOne, getOne, getAll,getAppartementById, updateOne, deleteOne, getOneBy };
