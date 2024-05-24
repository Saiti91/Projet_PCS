require('dotenv').config();

// Importation du module pg-promise, une bibliothèque pour gérer la connexion à PostgreSQL
const pgp = require("pg-promise")({
    // Activation du monitoring de requête pour le débogage
    query(e) {
        console.log('QUERY:', e.query);
    },
    error(err, e) {
        if (e.query) {
            console.error('QUERY:', e.query);
        }
        console.error('ERROR:', err);
    }
});

// Configuration pour éviter les affichages de mot de passe dans les logs
const connectionOptions = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Assurez-vous que le nom de la variable d'environnement est correct
    database: process.env.DB_DATABASE,
};

// Création d'une instance de la connexion à la base de données
const db = pgp(connectionOptions);

// Test de la connexion pour s'assurer que tout fonctionne correctement
db.connect()
    .then(obj => {
        console.log("Connexion à la base de données réussie");
        obj.done(); // libère la connexion
    })
    .catch(error => {
        console.error("Échec de la connexion à la base de données:", error.message);
    });

// Exportation de l'objet db pour permettre son utilisation dans d'autres parties de l'application
module.exports = db;
