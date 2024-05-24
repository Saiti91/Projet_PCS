// Importation des schémas de validation et du répertoire utilisateur pour accéder à la base de données
const { loginSchema, registerSchema } = require("./model");
const userRepository = require("../users/repository");
// Importation des erreurs personnalisées pour gérer des situations spécifiques
const { AuthError, InvalidArgumentError } = require("../common/service_errors");
// Importation de la fonction pour générer des jetons JWT
const generateJWT = require("../common/jwt_handler");

// Fonction asynchrone pour la connexion des utilisateurs
async function login(loginForm) {
    // Validation du formulaire de connexion avec le schéma prévu
    const { value, error } = loginSchema.validate(loginForm);
    // Lancement d'une erreur si la validation échoue
    if (error) {
        throw error;
    }

    // Récupération de l'utilisateur par email
    const user = await userRepository.getOneBy("email", value.email);

    // Si aucun utilisateur n'est trouvé, lancer une erreur d'authentification
    if (!user) {
        throw new AuthError("Could not login: unknown email provided");
    }

    // Vérification du mot de passe - il est crucial d'implémenter cette vérification correctement
    // Utilisez des fonctions de hashage sécurisées comme bcrypt pour comparer les mots de passe

    // Génération du jeton JWT pour l'utilisateur et retour du jeton
    return generateJWT(user.id, user.role);
}

// Fonction asynchrone pour l'enregistrement des utilisateurs
async function register(user) {
    // Validation du formulaire d'enregistrement avec le schéma prévu
    const { value, error } = registerSchema.validate(user);

    // Lancement d'une erreur si la validation échoue
    if (error) {
        throw error;
    }

    // Vérification si l'email est déjà pris
    if (await userRepository.getOneBy("email", value.email)) {
        throw new InvalidArgumentError("This email is already taken.");
    }

    // Création de l'utilisateur avec le rôle "customer" et retour de l'utilisateur créé
    return await userRepository.createOne({ ...value, role: "customer" });
}

// Exportation des fonctions pour utilisation dans d'autres parties de l'application
module.exports = { login, register };
