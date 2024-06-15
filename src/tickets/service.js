const {createTicketSchema, updateTicketSchema} = require("./model");
const ticketRepository = require("./repository");
const {InvalidArgumentError} = require("../common/service_errors");

async function createTicket(data) {
    const {value, error} = createTicketSchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid ticket data!");
    }
    return await ticketRepository.createTicket(value);
}

async function updateTicket(ticketId, data) {
    const {value, error} = updateTicketSchema.validate(data);
    if (error) {
        console.error("Validation error:", error);
        throw new InvalidArgumentError("Invalid ticket data!");
    }
    return await ticketRepository.updateTicket(ticketId, value);
}

async function getTicketById(ticketId) {
    return await ticketRepository.getTicketById(ticketId);
}

async function getAllTickets() {
    return await ticketRepository.getAllTickets();
}

module.exports = {
    createTicket,
    updateTicket,
    getTicketById,
    getAllTickets,
};
