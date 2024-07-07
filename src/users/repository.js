const db = require("../common/db_handler");
const pgp = require("pg-promise")();

// Fonction pour créer une adresse
async function createAddress(address, t) {
    return await t.one(
        pgp.helpers.insert(address, null, "address") + " RETURNING *;"
    );
}

// Création d'un utilisateur classique
async function createUser(user) {
    return await db.tx(async t => {
        const attributesString = pgp.helpers.insert(user, null, "users") + " RETURNING *;";
        return await t.one(attributesString, user);
    });
}

// Création d'un fournisseur de services
async function createProvider(provider) {
    return await db.tx(async t => {
        // Créer l'utilisateur avec le rôle 'provider'
        const userAttributes = {
            role: 'provider',
            email: provider.email,
            password: provider.password,
            first_name: provider.name.split(" ")[0], // Option pour séparer le prénom et le nom
            last_name: provider.name.split(" ").slice(1).join(" "),
            telephone: provider.telephone || null
        };

        const newUser = await t.one(
            pgp.helpers.insert(userAttributes, null, "users") + " RETURNING *;",
            userAttributes
        );

        // Créer l'adresse pour le fournisseur de services
        const newAddress = await createAddress(provider.address, t);

        const serviceProvider = {
            name: provider.name,
            address_id: newAddress.address_id,
            maxOperatingRadius: provider.maxOperatingRadius || 0,
            price: provider.price || 0.0,
            employee_count: provider.employee_count || 0
        };

        const newServiceProvider = await t.one(
            pgp.helpers.insert(serviceProvider, null, "servicesProviders") + " RETURNING *;",
            serviceProvider
        );

        // Insérer les types de services associés
        if (provider.type && provider.type.length > 0) {
            const serviceTypesData = provider.type.map(typeId => ({
                serviceProvider_id: newServiceProvider.servicesProviders_id,
                serviceType_id: typeId,
                price: provider.price || 0.0
            }));
            const serviceTypesInsert = pgp.helpers.insert(serviceTypesData, ["serviceProvider_id", "serviceType_id", "price"], "serviceProviderToServiceTypes");
            await t.none(serviceTypesInsert);
        }

        return newUser;
    });
}

// Création d'un utilisateur (classique ou fournisseur)
async function createOne(user) {
    if (user.role === 'provider') {
        return await createProvider(user);
    } else {
        return await createUser(user);
    }
}

// Récupère un utilisateur en fonction de son ID
async function getOne(id) {
    return await db.oneOrNone("SELECT * FROM users WHERE users_id=${id}", {id});
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
        {id, ...user}
    );
}

// Supprime un utilisateur par son ID
async function deleteOne(id) {
    return await db.oneOrNone("DELETE FROM users WHERE users_id=${id} RETURNING users_id;", {id});
}

module.exports = {createOne, getOne, getAll, updateOne, deleteOne, getOneBy,createProvider};
