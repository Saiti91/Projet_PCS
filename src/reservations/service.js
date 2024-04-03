const { createReservationSchema, updateReservationSchema } = require("./model");
const Repository = require("./repository");
const locationService = require("../locations/service");
const { InvalidArgumentError } = require("../common/service_errors");

async function createOne(reservation) {
    const { value, error } = createReservationSchema.validate(reservation);

    if (error) {
        throw error;
    }

    const location = await locationService.getOne(reservation.location);

    if (!location) {
        throw new InvalidArgumentError(
            "The location you're looking to reserve does not exist."
        );
    }

    if (!value.location) {
        throw new InvalidArgumentError(
            "The location you're looking to reserve is not available for now."
        );
    }

    const overlapping = await Repository.getOverlappingReservations(
        value.date_start,
        value.date_end,
        value.location
    );

    if (overlapping.length) {
        throw new InvalidArgumentError(
            "This interval is not available. Please try another."
        );
    }

    return await Repository.createOne(value);
}

async function getOne(id) {
    return await Repository.getOne(id);
}

async function getAll() {
    return await Repository.getAll();
}

async function updateOne(id, reservation) {
    const { value, error } = updateReservationSchema.validate(reservation);

    if (error) {
        throw error;
    }

    const overlapping = await Repository.getOverlappingReservations(
        value.date_start,
        value.date_end,
        value.location
    );

    if (overlapping.length) {
        throw new InvalidArgumentError(
            "This interval is not available. Please try another."
        );
    }

    return await Repository.updateOne(id, value);
}

async function deleteOne(id) {
    return await Repository.deleteOne(id);
}

module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
