// Importation du module pg-promise, une bibliothèque pour gérer la connexion à PostgreSQL
const pgp = require("pg-promise");

// Création d'une instance de la connexion à la base de données
// Cette chaîne contient les informations nécessaires : utilisateur, mot de passe, serveur, port, et nom de la base de données
const db = pgp()({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.PORT,
    database: process.env.DB_DATABASE,
});

// Affichage dans la console pour indiquer que la connexion à la base de données a été initialisée
console.log("initiated db");

// Exportation de l'objet db pour permettre son utilisation dans d'autres parties de l'application
module.exports = db;
