// Importation de express-jwt alias jwt pour gérer la validation des JWT et des types de base d'Express
const {expressjwt : jwt} = require("express-jwt");

// Exportation par défaut du middleware jwt configuré
module.exports = jwt({
    secret: "secret",             // La clé secrète utilisée pour signer les tokens JWT
    algorithms: ["HS256"],        // Liste des algorithmes de codage acceptés pour les tokens
    credentialsRequired: false,   // Spécifie si le middleware doit échouer si aucun token n'est fourni
});
