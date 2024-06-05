// Importation de la classe d'erreur personnalisée pour les situations non autorisées
const {UnauthorizedError} = require("../service_errors");

// Définition d'une fonction qui prend un tableau de rôles autorisés
function authorize(roles) {
    // Retourne une fonction middleware qui prend les objets de requête, de réponse, et la fonction next
    return (req, res, next) => {
        // Vérification si le rôle de l'utilisateur (req.auth.urole) fait partie des rôles autorisés
        // ou si l'utilisateur est un admin
        if (roles.includes(req.auth && req.auth.urole) || (req.auth && req.auth.urole === "admin")) {
            next(); // Si autorisé, passe au middleware suivant
        } else {
            throw new UnauthorizedError("You do not have permission to perform this action."); // Sinon, lève une erreur d'autorisation
        }
    };
}

// Exportation de la fonction pour utilisation dans d'autres parties de l'application
module.exports = authorize;
