// Importation des schémas de validation et des référentiels nécessaires
const { createLocationSchema, updateLocationSchema } = require("./model");
const Repository = require("./repository");
const { InvalidArgumentError } = require("../common/service_errors");

async function createOne(calendar) {
    // Validation de l'emplacement avec le schéma défini
    const { value, error } = createLocationSchema.validate(calendar);
    if (error) {
        throw error;
    }
    // Création de l'emplacement dans la base de données et retour du résultat
    return await Repository.createAvailabilities(value);
}



// Fonction asynchrone pour récupérer un emplacement par son identifiant
async function getOne(id) {
    return await Repository.getById(id);
}

// Fonction asynchrone pour récupérer tous les emplacements
async function getAll() {
    return await Repository.getAllAvailabilities();
}

// Fonction asynchrone pour mettre à jour un emplacement existant
async function updateOne(schema) {
    // Validation de l'emplacement avec le schéma de mise à jour
    const { value, error } = updateLocationSchema.validate(schema);

    if (error) {
        throw error;
    }

    // Mise à jour de l'emplacement dans la base de données et retour du résultat
    return await Repository.updateAvailabilities(value);
}

// Fonction asynchrone pour supprimer un emplacement par son identifiant
async function deleteOne(id) {
    return await Repository.deleteOne(id);
}

// Exportation des fonctions pour utilisation dans d'autres parties de l'application
module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
