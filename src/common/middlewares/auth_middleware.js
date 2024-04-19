// Importation de express-jwt pour gérer la validation des JWT et des types de base d'Express
import { expressjwt as jwt } from "express-jwt";
import { Request, Response } from "express";

// Exportation par défaut du middleware jwt configuré
export default jwt({
    secret: "secret",             // La clé secrète utilisée pour signer les tokens JWT
    algorithms: ["HS256"],        // Liste des algorithmes de codage acceptés pour les tokens
    credentialsRequired: false,   // Spécifie si le middleware doit échouer si aucun token n'est fourni
});
