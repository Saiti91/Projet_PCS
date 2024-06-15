const db = require("../common/db_handler");

const createInvoice = async (invoice) => {
    const {userId, providerId, reservationId, amount, issuedDate, paid} = invoice;
    const result = await db.query(
        `INSERT INTO invoices (user_id, provider_id, reservation_id, amount, issued_date, paid) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, providerId, reservationId, amount, issuedDate, paid]
    );
    return result.rows[0];
};

const updateInvoice = async (invoiceId, updates) => {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setString = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const result = await db.query(
        `UPDATE invoices SET ${setString} WHERE invoice_id = $${keys.length + 1} RETURNING *`,
        [...values, invoiceId]
    );
    return result.rows[0];
};

const getInvoiceById = async (invoiceId) => {
    const result = await db.query("SELECT * FROM invoices WHERE invoice_id = $1", [invoiceId]);
    return result.rows[0];
};

const getAllInvoices = async () => {
    const result = await db.query("SELECT * FROM invoices");
    return result.rows;
};

module.exports = {
    createInvoice,
    updateInvoice,
    getInvoiceById,
    getAllInvoices,
};
