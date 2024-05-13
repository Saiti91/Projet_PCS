const { createServicesSchema, updateServicesSchema } = require("./model");
const Repository = require("./repository");
const { InvalidArgumentError, UnauthorizedError } = require("../common/service_errors");

// Fonction de création de service
async function createOne(service) {
    const { value, error } = createServicesSchema.validate(service);

    if (error) {
        throw error;
    }
    //check si le service existe déja
    if (await Repository.getOneBy("name", value.name)) {
        throw new InvalidArgumentError("This service name is already taken.");
    }

    const newService = await Repository.createOne(value);

    return { ...newService/*, password: "[redacted]"*/ };
}

// fonction de récupération d'un service en fonction d'un id
async function getOne(id, issuer) {
    if (["provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You can only see your own service.");
    }

    const service = await Repository.getOne(id);
    if (service) {
        return { ...service/*, password: "[redacted]"*/ };
    } else return service;
}

async function getOneBy(attribute, value) {
    const service = await Repository.getOneBy("name", value.name);
    if (service) {
        return { ...service/*, password: "[redacted]"*/ };
    } else return service;
}



//fonction de récupération de tous les utilisateurs
async function getAll() {
    const services = await Repository.getAll();
    return services.map((service) => ({ ...service/*, password: "[redacted]" */}));
}

// fonction de changement d'information sur un utilisateur en fonction de son ID
async function updateOne(id, service, issuer) {
    if (["customer", "owner","provider"].includes(issuer.role) && issuer.id !== id) {
        throw new UnauthorizedError("You cannot update services.");
    }

    if (["customer", "owner","provider"].includes(issuer.role) && service.role) {
        throw new UnauthorizedError("You cannot update services.");
    }

    // if (issuer.role === "staff" && service.role === "admin") {
    //     throw new UnauthorizedError("Only admins can create admins.");
    // }

    const { value, error } = updateServicesSchema.validate(service);
    if (error) {
        throw error;
    }

    const newService = await Repository.updateOne(id, value);

    if (newService) {
        return { ...newService/*, password: "[redacted]"*/ };
    }

    return newService;
}

// Suppression d'un utilisateur
async function deleteOne(id, issuer) {

    if (["customer", "owner","provider"].includes(issuer.role)) {
        throw new UnauthorizedError("You cannot delete a service.");
    }

    return await Repository.deleteOne(id);
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
