// Importation des schémas de validation et des référentiels nécessaires
const {apartmentCommentSchema, serviceProviderCommentSchema} = require("./model");
const Repository = require("./repository");
const {InvalidArgumentError} = require("../common/service_errors");

async function validateAndExecute(schema, data, repositoryFunction) {
    const {value, error} = schema.validate(data);
    if (error) {
        throw new InvalidArgumentError(error.details[0].message);
    }
    return await repositoryFunction(value);
}

async function createComment(comment) {
    const schema = comment.type === 'apartment' ? apartmentCommentSchema : serviceProviderCommentSchema;
    return await validateAndExecute(schema, comment, Repository.addComment);
}

async function getCommentsByEntity(entity) {
    if (entity.type === 'apartment') {
        return await Repository.getCommentsByApartmentId(entity.id);
    } else if (entity.type === 'serviceProvider') {
        return await Repository.getCommentsByServiceProviderId(entity.id);
    } else {
        throw new InvalidArgumentError('Invalid entity type');
    }
}

async function getAllComments() {
    return await Repository.getAllComments();
}

async function updateComment(id, comment) {
    const schema = comment.type === 'apartment' ? apartmentCommentSchema : serviceProviderCommentSchema;
    return await validateAndExecute(schema, {...comment, id}, Repository.updateComment);
}

async function deleteComment(id) {
    return await Repository.deleteComment(id);
}

// Exportation des fonctions pour utilisation dans d'autres parties de l'application
module.exports = {
    createComment,
    getCommentsByEntity,
    getAllComments,
    updateComment,
    deleteComment
};
