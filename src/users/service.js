// users/service.js
const {createUserSchema, updateUserSchema} = require("./model");
const Repository = require("./repository");
const {InvalidArgumentError, UnauthorizedError} = require("../common/service_errors");
const calendar = require("../apartmentCalendar/repository");


// Fonction de création d'utilisateur
async function createOne(user) {
    // Validation de l'utilisateur avec un schéma Joi ou similaire
    const {value, error} = createUserSchema.validate(user);
    if (error) {
        throw error;
    }

    // Vérification de l'existence de l'email
    if (await Repository.getOneBy("email", value.email)) {
        throw new InvalidArgumentError("This email is already taken.");
    }

    // Création de l'utilisateur dans la base de données
    const newUser = await Repository.createOne(value);

    // Si l'utilisateur créé a le rôle "provider", effectuer des opérations supplémentaires
    if (newUser.role === 'provider') {
        // Par exemple, créer un calendrier pour le provider
        await calendar.createProviderCalendar(newUser.id); // Assurez-vous que cette fonction existe et est implémentée correctement
    }

    // Renvoi de l'utilisateur nouvellement créé avec le mot de passe masqué
    return {...newUser, password: "[redacted]"};
}

// fonction de récupération d'un utilisateur en fonction d'un id
async function getOne(id, issuer) {
    if (["customer", "owner", "provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only see your own account.");
    }

    const user = await Repository.getOne(id);
    if (user) {
        return {...user, password: "[redacted]"};
    } else return user;
}

//fonction de récupération de tous les utilisateurs
async function getAll() {
    const users = await Repository.getAll();
    return users.map((user) => ({...user, password: "[redacted]"}));
}

// fonction de changement d'information sur un utilisateur en fonction de son ID
async function updateOne(id, user, issuer) {
    console.log('Service ')
    console.log('ID: ',id)
    console.log('User: ', user)
    console.log('Issuer',issuer)
    if (["customer", "owner", "provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only update your own account.");
    }

    if (issuer.role === "staff" && user.role === "admin") {
        throw new UnauthorizedError("Only admins can create admins.");
    }

    if (
        issuer.role === "staff" &&
        (await Repository.getOne(id))?.role === "admin"
    ) {
        throw new UnauthorizedError("Staff cannot downgrade admins.");
    }

    const {value, error} = updateUserSchema.validate(user);
        if (error) {
        throw error;
    }

    if (await Repository.getOneBy("email", value.email)) {
        throw new InvalidArgumentError("This email is already taken.");
    }
    console.log('Service',id,value)
    const newUser = await Repository.updateOne(id, value);

    if (newUser) {
        return {...newUser, password: "[redacted]"};
    }

    return newUser;
}

// Suppression d'un utilisateur
async function deleteOne(id, issuer) {

    if (["customer", "owner", "provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only delete your own account.");
    }

    if ((await Repository.getOne(id))?.role === "admin") {
        throw new UnauthorizedError("You cannot delete an admin's account.");
    }

    return await Repository.deleteOne(id);
}

module.exports = {createOne, getOne, getAll, updateOne, deleteOne};
