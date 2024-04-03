const { createLocationSchema, updateLocationSchema } = require("./model");
const Repository = require("./repository");
const UserRepository = require("../users/repository");
const { InvalidArgumentError } = require("../common/service_errors");

async function createOne(location) {
    const { value, error } = createLocationSchema.validate(location);

    if (error) {
        throw error;
    }

    const owner = await UserRepository.getOne(location.owner);

    if (!owner) {
        throw new InvalidArgumentError("Provided owner does not have an account!");
    }

    if (owner.role === "customer") {
        UserRepository.updateOne(location.owner, { role: "owner" });
    }

    return await Repository.createOne(value);
}

async function getOne(id) {
    return await Repository.getOne(id);
}

async function getAll() {
    return await Repository.getAll();
}

async function updateOne(id, location) {
    const { value, error } = updateLocationSchema.validate(location);
    if (error) {
        throw error;
    }

    // TODO: when user no exist
    return await Repository.updateOne(id, value);
}

async function deleteOne(id) {
    return await Repository.deleteOne(id);
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
