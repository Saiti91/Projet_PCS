require('dotenv').config();

const pgp = require("pg-promise")({
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

const connectionOptions = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

const db = pgp(connectionOptions);

db.connect()
    .then(obj => {
        console.log("Connexion à la base de données réussie");
        obj.done();
    })
    .catch(error => {
        console.error("Échec de la connexion à la base de données:", error.message);
    });

module.exports = db;
