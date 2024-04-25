// Importation des schémas de validation et des référentiels nécessaires
const { createLocationSchema, updateLocationSchema } = require("./model");
const Repository = require("./repository");
const UserRepository = require("../users/repository");
const { InvalidArgumentError } = require("../common/service_errors");

// Fonction asynchrone pour créer un nouvel emplacement
async function createOne(location) {
    // Validation de l'emplacement avec le schéma défini
    const { value, error } = createLocationSchema.validate(location);

    // Lancer une erreur si la validation échoue
    if (error) {
        throw error;
    }

    // Récupération de l'utilisateur propriétaire pour vérifier son existence
    const owner = await UserRepository.getOne(location.owner);

    // Lancer une erreur si le propriétaire n'existe pas
    if (!owner) {
        throw new InvalidArgumentError("Provided owner does not have an account!");
    }

    // Mise à jour du rôle de l'utilisateur si nécessaire
    if (owner.role === "customer") {
        await UserRepository.updateOne(location.owner, {role: "owner"});
    }

    // Création de l'emplacement dans la base de données et retour du résultat
    return await Repository.createOne(value);
}

// Fonction asynchrone pour récupérer un emplacement par son identifiant
async function getOne(id) {
    return await Repository.getOne(id);
}

// Fonction asynchrone pour récupérer tous les emplacements
async function getAll() {
    return await Repository.getAll();
}

// Fonction asynchrone pour mettre à jour un emplacement existant
async function updateOne(id, location) {
    // Validation de l'emplacement avec le schéma de mise à jour
    const { value, error } = updateLocationSchema.validate(location);

    // Lancer une erreur si la validation échoue
    if (error) {
        throw error;
    }

    // Mise à jour de l'emplacement dans la base de données et retour du résultat
    return await Repository.updateOne(id, value);
}

// Fonction asynchrone pour supprimer un emplacement par son identifiant
async function deleteOne(id) {
    return await Repository.deleteOne(id);
}

// Exportation des fonctions pour utilisation dans d'autres parties de l'application
module.exports = { createOne, getOne, getAll, updateOne, deleteOne };
