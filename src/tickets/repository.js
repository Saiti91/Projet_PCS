const db = require("../common/db_handler");

const createTicket = async (ticket) => {
    const {userId, serviceProviderId, subject, description, priority, category, status, assignedTo} = ticket;
    const result = await db.query(
        `INSERT INTO tickets (user_id, serviceProvider_id, subject, description, priority, category, status, assigned_to) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, serviceProviderId, subject, description, priority, category, status, assignedTo]
    );
    return result.rows[0];
};

const updateTicket = async (ticketId, updates) => {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setString = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const result = await db.query(
        `UPDATE tickets SET ${setString} WHERE ticket_id = $${keys.length + 1} RETURNING *`,
        [...values, ticketId]
    );
    return result.rows[0];
};

const getTicketById = async (ticketId) => {
    const result = await db.query("SELECT * FROM tickets WHERE ticket_id = $1", [ticketId]);
    return result.rows[0];
};

const getAllTickets = async () => {
    const result = await db.query("SELECT * FROM tickets");
    return result.rows;
};

module.exports = {
    createTicket,
    updateTicket,
    getTicketById,
    getAllTickets,
};
