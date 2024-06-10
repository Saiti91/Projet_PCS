const { createInvoiceSchema, updateInvoiceSchema } = require("./model");
const invoiceRepository = require("./repository");
const { InvalidArgumentError } = require("../common/service_errors");

async function createInvoice(data) {
    const { value, error } = createInvoiceSchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid invoice data!");
    }
    return await invoiceRepository.createInvoice(value);
}

async function updateInvoice(invoiceId, data) {
    const { value, error } = updateInvoiceSchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid invoice data!");
    }
    return await invoiceRepository.updateInvoice(invoiceId, value);
}

async function getInvoiceById(invoiceId) {
    return await invoiceRepository.getInvoiceById(invoiceId);
}

async function getAllInvoices() {
    return await invoiceRepository.getAllInvoices();
}

module.exports = {
    createInvoice,
    updateInvoice,
    getInvoiceById,
    getAllInvoices,
};
