# Demander l'exécution en tant qu'administrateur
Start-Process PowerShell -ArgumentList "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -Verb RunAs

# Télécharger l'image Docker pour PostgreSQL
Write-Host "Téléchargement de l'image Docker pour PostgreSQL..."
docker pull postgres:latest

# Supprimer tout conteneur existant avec le même nom pour éviter les conflits
Write-Host "Suppression de tout conteneur existant avec le même nom..."
docker rm -f PCS_postgres

# Lancer le Docker de la base de données PostgreSQL avec le script SQL et activer le redémarrage automatique
Write-Host "Démarrage du conteneur Docker pour PostgreSQL..."
docker run --name PCS_postgres -e POSTGRES_PASSWORD=password -d --restart unless-stopped -v ${PWD}/database:/docker-entrypoint-initdb.d -p 5432:5432 postgres:latest

# Attendre que le conteneur soit complètement démarré
Write-Host "Attente de 5 secondes pour que le conteneur démarre..."
Start-Sleep -Seconds 5

# Exécuter le script SQL
Write-Host "Exécution du script SQL pour initialiser la base de données..."
docker exec -i PCS_postgres psql -U postgres -f /docker-entrypoint-initdb.d/datainit/dataInit.sql

# Vérifier si Node.js est installé et l'installer si ce n'est pas le cas
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled)
{
    # installs fnm (Fast Node Manager)
    winget install Schniz.fnm
    # download and install Node.js
    fnm use --install-if-missing 22
    # verifies the right Node.js version is in the environment
    node -v # should print `v22.3.0`
    # verifies the right NPM version is in the environment
    npm -v # should print `10.8.1`n
}

# Installer les dépendances du projet
Write-Host "Installation des dépendances du projet se trouvant dans package.json..."
npm install
npm update

# Message final
Write-Host "L'installation est terminée. Votre application est prête à être utilisée !"
