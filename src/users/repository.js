const db = require("../common/db_handler");
const pgp = require("pg-promise")();

// Fonction pour créer une adresse
async function createAddress(address, t) {
    console.log(address, t);
    const res = await t.one(
        'INSERT INTO address (street, town, cp, latitude, longitude) ' +
        'VALUES ($1, $2, $3, $4, $5) RETURNING *;',
        [address.street, address.town, address.CP, address.latitude, address.longitude]
    );
    console.log(res);
    return res;
}

// Création d'un utilisateur classique
async function createUser(user) {
    return await db.tx(async t => {
        const attributesString = pgp.helpers.insert(user, null, "users") + " RETURNING *;";
        return await t.one(attributesString, user);
    });
}

// Création d'un fournisseur de services
async function createProvider(provider, address) {
    return await db.tx(async t => {

        // Créer l'adresse pour le fournisseur de services
        const newAddress = await createAddress(address, t);
        console.log(newAddress)
        console.log(newAddress.address_id)
        const serviceProvider = {
            name: provider.name,
            address_id: newAddress.address_id,
            maxOperatingRadius: provider.maxOperatingRadius || 10,
            employee_count: provider.employee_count || 1
        };

        const newServiceProvider = await t.oneOrNone(
            'INSERT INTO servicesproviders (name, telephone, address_id, maxoperatingradius, employee_count) ' +
            'values ($1, $2, $3, $4, $5) RETURNING *;',
            [
                serviceProvider.name,
                provider.telephone,
                serviceProvider.address_id,
                serviceProvider.maxOperatingRadius,
                serviceProvider.employee_count
            ]
        );
        console.log(newServiceProvider)
        const newUser = await t.oneOrNone(
            'INSERT INTO users (role, email, password, telephone,serviceprovider_id) values ($1, $2, $3, $4,$5) RETURNING *;',
            [provider.role, provider.email, provider.password, provider.telephone,newServiceProvider.servicesproviders_id]
        );

        // Insérer les types de services associés
        if (provider.services && provider.services.length > 0) {
            const serviceTypesData = provider.services.map(service => ({
                serviceProvider_id: newServiceProvider.servicesproviders_id,
                serviceType_id: service.id,
                price: service.price || 0.0
            }));
            const serviceTypesInsert = pgp.helpers.insert(serviceTypesData, ["serviceProvider_id", "serviceType_id", "price"], "serviceProviderToServiceTypes");
            await t.none(serviceTypesInsert);
        }

        return newUser;
    });
}

// Création d'un utilisateur (classique ou fournisseur)
async function createOne(user, address = null) {
    if (user.role === 'provider') {
        return await createProvider(user, address);
    } else {
        return await createUser(user);
    }
}

// Récupère un utilisateur en fonction de son ID
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM users WHERE users_id=${id}", { id });
}

// Récupère un ou plusieurs utilisateurs en fonction d'un attribut
async function getOneBy(attribute, value) {
    const res = await db.oneOrNone(
        `SELECT *
         FROM users
         WHERE ${attribute} = $1`, [value]
    );
    console.log(res);
    return res || null;
}

// Récupère tous les utilisateurs
async function getAll() {
    const res = await db.manyOrNone("SELECT * FROM users");
    return res || [];
}

// Update un utilisateur
async function updateOne(id, user) {
    const attrsStr = Object.keys(user)
        .map((k) => ` ${k} = $<${k}> `)
        .join(",");

    return await db.oneOrNone(
        `UPDATE users
         SET ${attrsStr}
         WHERE users_id = ${id}
         RETURNING *;`,
        { id, ...user }
    );
}

// Supprime un utilisateur par son ID
async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM users WHERE users_id=${id} RETURNING users_id;", { id });
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne, getOneBy, createProvider };
