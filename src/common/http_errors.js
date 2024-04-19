// Définition d'une classe de base pour les erreurs HTTP
class HTTPError extends Error {
    constructor(message) {
        super(message);  // Appel au constructeur de la classe parente, Error
        this.status = 500;  // Statut HTTP par défaut pour les erreurs génériques est 500 (Internal Server Error)
    }
}

// Définition d'une classe pour les erreurs de type "Not Found"
class NotFoundError extends HTTPError {
    constructor(message) {
        super(message);  // Appel au constructeur de la classe parente, HTTPError
        this.status = 404;  // Statut HTTP pour les erreurs de type "Not Found"
    }
}

// Exportation des classes pour permettre leur utilisation dans d'autres parties de l'application
module.exports = { HTTPError, NotFoundError };
