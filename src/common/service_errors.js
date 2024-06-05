// Définition d'une classe d'erreur pour les erreurs liées aux arguments invalides
class InvalidArgumentError extends Error {
    constructor(message) {
        super(message || "Something went wrong with the provided data."); // Appel au constructeur de la classe Error
        // Message par défaut si aucun message n'est fourni
    }
}

// Définition d'une classe d'erreur pour les erreurs d'authentification
class AuthError extends Error {
    constructor(message) {
        super(message || "An error prevented you from authenticating."); // Message par défaut pour les erreurs d'authentification
    }
}

// Définition d'une classe d'erreur pour les erreurs d'autorisation
class UnauthorizedError extends Error {
    constructor(message) {
        super(message || "You are not allowed to perform this action."); // Message par défaut pour les actions non autorisées
    }
}

// Exportation des classes d'erreur pour utilisation dans d'autres parties de l'application
module.exports = {InvalidArgumentError, AuthError, UnauthorizedError};
