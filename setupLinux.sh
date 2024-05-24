#!/bin/bash

# Assurer que le script est exécuté en tant que superutilisateur (sudo)
if [[ $EUID -ne 0 ]]; then
  echo "Ce script doit être exécuté en tant que root (sudo)" 1>&2
  exit 1
fi

#update
apt update -y

# Installation de Docker
echo "Installation de Docker..."
if ! command -v docker &> /dev/null; then
  apt-get update
  apt-get install -y docker.io
fi

# Télécharger l'image Docker pour PostgreSQL
echo "Téléchargement de l'image Docker pour PostgreSQL..."
docker pull postgres:latest

# Lancer le Docker de la base de données PostgreSQL avec le script SQL
echo "Démarrage du conteneur Docker pour PostgreSQL..."
docker run --name PCS_postgres -e POSTGRES_PASSWORD=password -d -v "$(pwd)/database:/docker-entrypoint-initdb.d" -p 5432:5432 postgres:latest

# Vérifier si Node.js est installé et l'installer si ce n'est pas le cas
if ! command -v node &> /dev/null; then
  echo "Node.js n'est pas installé. Installation de Node.js..."
  curl -sL https://deb.nodesource.com/setup_16.x | bash -
  apt-get install -y nodejs
fi

# Installer les dépendances du projet
echo "Installation des dépendances du projet..."
npm install
npm install body-parser
npm install express
npm install express-jwt
npm install joi
npm install jsonwebtoken
npm install pg-promise
npm install yaml
npm install dotenv

# Message final
echo "L'installation est terminée. Votre application est prête à être utilisée !"
