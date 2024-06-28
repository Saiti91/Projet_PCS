const { createApartmentAvailabilitySchema, updateApartmentAvailabilitySchema } = require("./model");
const Repository = require("./repository");

async function createOne(calendar) {
    const { value, error } = createApartmentAvailabilitySchema.validate(calendar);
    if (error) {
        throw error;
    }
    return await Repository.createAvailabilities(value);
}

async function getOne(id) {
    return await Repository.getById(id);
}

async function getAll() {
    return await Repository.getAllAvailabilities();
}

async function updateAvailabilities(apartmentId, dates) {
    const { value, error } = updateApartmentAvailabilitySchema.validate({
        apartment_id: apartmentId,
        dates: dates // Ensure dates is passed as an array
    });

    console.log("Validation result:", value, error);
    console.log("dates:", value.dates);

    if (error) {
        throw error;
    }
    return await Repository.updateAvailabilities(apartmentId, value.dates);
}

async function deleteOne(id) {
    return await Repository.deleteAvailabilitiesByApartmentId(id);
}

module.exports = { createOne, getOne, getAll, updateAvailabilities, deleteOne };
