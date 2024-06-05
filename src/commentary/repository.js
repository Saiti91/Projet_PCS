// Importation du gestionnaire de base de données
const db = require("../common/db_handler");

async function getAllComments() {
    try {
        const result = await db.query('SELECT * FROM comments');
        return result.rows;
    } catch (error) {
        console.error('Error fetching all comments:', error);
        throw error;
    }
}

async function getCommentsByApartmentId(apartmentId) {
    try {
        const result = await db.query('SELECT * FROM comments WHERE type = $1 AND entity_id = $2', ['apartment', apartmentId]);
        return result.rows;
    } catch (error) {
        console.error(`Error fetching comments for apartment ID ${apartmentId}:`, error);
        throw error;
    }
}

async function getCommentsByServiceProviderId(serviceProviderId) {
    try {
        const result = await db.query('SELECT * FROM comments WHERE type = $1 AND entity_id = $2', ['serviceProvider', serviceProviderId]);
        return result.rows;
    } catch (error) {
        console.error(`Error fetching comments for service provider ID ${serviceProviderId}:`, error);
        throw error;
    }
}

async function addComment(type, entityId, comment) {
    try {
        const result = await db.query('INSERT INTO comments (type, entity_id, comment) VALUES ($1, $2, $3) RETURNING *', [type, entityId, comment]);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

async function updateComment(id, comment) {
    try {
        const result = await db.query('UPDATE comments SET comment = $1, updated_at = CURRENT_TIMESTAMP WHERE comments_id = $2 RETURNING *', [comment, id]);
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating comment with ID ${id}:`, error);
        throw error;
    }
}

async function deleteComment(id) {
    try {
        const result = await db.query('DELETE FROM comments WHERE comments_id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (error) {
        console.error(`Error deleting comment with ID ${id}:`, error);
        throw error;
    }
}

module.exports = {
    getAllComments,
    getCommentsByApartmentId,
    getCommentsByServiceProviderId,
    addComment,
    updateComment,
    deleteComment
};
