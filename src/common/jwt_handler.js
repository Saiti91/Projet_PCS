// Importation du module jsonwebtoken, utilisé pour créer des JWT
const jwt = require("jsonwebtoken");

// Fonction pour générer un JWT pour un utilisateur spécifique
function generateJWT(userId, role) {
    return jwt.sign(
        {
            uid: userId,  // Identifiant de l'utilisateur
            urole: role,  // Rôle de l'utilisateur, utile pour les contrôles d'autorisation
        },
        "secret"  // Clé secrète utilisée pour signer le JWT
    );
}

// Exportation de la fonction pour permettre son utilisation dans d'autres parties de l'application
module.exports = generateJWT;
