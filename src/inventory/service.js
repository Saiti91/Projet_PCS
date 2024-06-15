const inventoryRepository = require("./repository");
const {InvalidArgumentError} = require("../common/service_errors");
const {createInventorySchema, confirmArrivalSchema, createExitInspectionSchema} = require("./model");

async function createPreArrivalInspection(data) {
    const {value, error} = createInventorySchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid inspection data!");
    }
    value.type = "pre-arrival";
    return await inventoryRepository.createInspection(value);
}

async function confirmArrivalInspection(data) {
    const {value, error} = confirmArrivalSchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid inspection data!");
    }
    return await inventoryRepository.updateInspection(value.inspectionId, {
        comments: value.comments,
        photos: value.photos,
        status: "confirmed"
    });
}

async function createExitInspectionByClient(data) {
    const {value, error} = createInventorySchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid inspection data!");
    }
    value.type = "exit-client";
    return await inventoryRepository.createInspection(value);
}

async function createExitInspectionByPCS(data) {
    const {value, error} = createInventorySchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid inspection data!");
    }
    value.type = "exit-pcs";
    return await inventoryRepository.createInspection(value);
}

module.exports = {
    createPreArrivalInspection,
    confirmArrivalInspection,
    createExitInspectionByClient,
    createExitInspectionByPCS,
};
