const db = require("../common/db_handler");

//création d'un utilisateur
async function createOne(user) {
    //Sépare les attributs de l'objet
    const attributesString = Object.keys(user).join(",");
    //Crée une String avec cet objet séparé
    const valuesString = Object.keys(user)
        .map((k) => `$<${k}>`)
        .join(",");

    return await db.one(
        `INSERT INTO users(${attributesString}) VALUES(${valuesString}) RETURNING *;`,
        user
    );
}
async function createProviderCalendar(providerId) {
    // Requête SQL pour insérer les disponibilités pour le provider
    const query = `
        INSERT INTO providerAvailabilities (available, date, provider_id)
        SELECT true, gs.date, $1 as provider_id
        FROM generate_series(current_date, current_date + interval '2 years', '1 day') as gs(date)`;

    try {
        // Exécuter la requête avec l'identifiant du provider
        await db.none(query, [providerId]);
        return { success: true, message: "Calendar created for provider for two years." };
    } catch (error) {
        console.error("Error creating calendar for provider:", error);
        return { success: false, message: error.message };
    }
}

//Récupère un utilisateur en fonction de son ID
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM users WHERE users_id=${id}", { id });
}

//Récupère un ou plusieurs utilisateurs en fonction d'un attribut
async function getOneBy(attribute, value) {
    return await db.oneOrNone(
        `SELECT * FROM users WHERE ${attribute} = ${value}`,
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
        `UPDATE users SET ${attrsStr} WHERE users_id = ${id} RETURNING *;`,
        { id, ...user }
    );

    return modified;
}

//Délete un user par son ID
async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM users WHERE users_id=${id} RETURNING users_id;", { id });
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne, getOneBy,createProviderCalendar };
