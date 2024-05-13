# Demander l'exécution en tant qu'administrateur
Start-Process PowerShell -ArgumentList "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -Verb RunAs

# Télécharger l'image Docker pour PostgreSQL
Write-Host "Téléchargement de l'image Docker pour PostgreSQL..."
docker pull postgres:latest

# Lancer le Docker de la base de données PostgreSQL avec le script SQL
Write-Host "Démarrage du conteneur Docker pour PostgreSQL..."
docker run --name PCS_postgres -e POSTGRES_PASSWORD=password -d -v ${PWD}\database:/docker-entrypoint-initdb.d postgres:latest

# Vérifier si Node.js est installé et l'installer si ce n'est pas le cas
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "Node.js n'est pas installé. Installation de Node.js..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    Invoke-WebRequest -useb get.scoop.sh | Invoke-Expression
    scoop install nodejs
}

# Installer les dépendances du projet
Write-Host "Installation des dépendances du projet..."
npm install
npm install body-parser
npm install express
npm install express-jwt
npm install express.js
npm install joi
npm install jsonwebtoken
npm install pg-promise
npm install yaml
npm install dotenv

# Message final
Write-Host "L'installation est terminée. Votre application est prête à être utilisée !"
