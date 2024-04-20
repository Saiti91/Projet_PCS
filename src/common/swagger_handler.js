// const swaggerJsdoc = require("swagger-jsdoc");
// // Importation du module path pour gérer les chemins de fichiers
// const path = require("path");
//
// // Définition du chemin de base pour les fichiers de l'API
// const basePath = path.join(__dirname, "..");
//
// // Options de configuration pour swagger-jsdoc
// const options = {
//     failOnErrors: true, // Indique si une erreur de parsing doit lever une exception. Par défaut, c'est false.
//     definition: {
//         openapi: "3.0.0", // Utilisation de la version 3.0.0 du standard OpenAPI
//         info: {
//             title: "PCS_API", // Titre de l'API
//             version: "1.0.0", // Version de l'API
//             description: "This API allows managing apartments for a company renting private people's properties.", // Description de l'API
//         },
//     },
//     // Chemins vers les fichiers contenant les annotations Swagger pour générer la documentation
//     apis: [path.join(basePath, "**", "*.js"), path.join(basePath, "index.js")],
// };
//
// // La ligne suivante, lorsqu'elle est décommentée, génère les spécifications Swagger à partir des options fournies
// const specs = swaggerJsdoc(options);
//
// // Exportation des spécifications pour leur utilisation dans d'autres parties de l'application
// module.exports = { specs };
//
