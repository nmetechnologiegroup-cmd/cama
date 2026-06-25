# 🐧 GUIDE DE DÉPLOIEMENT PRODUCTION SUR DEBIAN (11 / 12) — CAMA BURKINA FASO

Ce guide décrit de manière professionnelle et sécurisée le déploiement complet de l'application de la **Caisse d'Assurance Maladie des Armées (CAMA)** sur un serveur d'entreprise fonctionnant sous **Debian 11 (Bullseye)** ou **Debian 12 (Bookworm)**.

Nous utiliserons une architecture de production moderne et robuste :
* **Frontend :** Fichiers statiques générés par React + Vite, servis de manière ultra-performante par **Nginx**.
* **Backend :** Serveur API Express, maintenu actif en arrière-plan par le gestionnaire de processus **PM2**.
* **Base de données :** **SQLite** (pour une installation rapide et autonome) ou **MariaDB** (recommandé pour la production multi-utilisateur).
* **Sécurité :** Reverse proxy Nginx, limitation des privilèges utilisateur, configuration du pare-feu `ufw` et chiffrement SSL **Let's Encrypt**.

---

## 🛠️ Étape 1 : Mise à jour et installation des paquets requis

Connectez-vous en tant que `root` (ou un utilisateur avec les droits `sudo`) sur votre serveur Debian et mettez à jour le système :

```bash
sudo apt update && sudo apt upgrade -y
```

Installez les outils de base indispensables :

```bash
sudo apt install -y curl git wget build-essential unzip sqlite3 ufw
```

---

## 🟢 Étape 2 : Installation de Node.js et PM2

Nous allons installer la version Node.js LTS (Active LTS, ex: Node.js 20) via le dépôt officiel NodeSource :

```bash
# Ajout du dépôt NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installation de Node.js
sudo apt install -y nodejs

# Vérification de l'installation
node -v
npm -v
```

Installez **PM2** globalement. Cet outil assurera que le serveur API s'exécute en arrière-plan et redémarre automatiquement en cas de crash du serveur ou de reboot de la machine :

```bash
sudo npm install -y -g pm2
```

---

## 🗄️ Étape 3 : Installation et Configuration de la Base de Données

Choisissez l'option qui correspond le mieux à vos contraintes de sécurité et d'infrastructure :

### OPTION A : Déploiement avec SQLite (Le plus rapide)
SQLite est déjà installé via les dépendances Debian précédentes. Aucune configuration réseau ou de service n'est requise.

### OPTION B : Déploiement avec MariaDB (Production Haute Disponibilité)

Installez le serveur MariaDB :

```bash
sudo apt install -y mariadb-server
```

Sécurisez l'installation par défaut de MariaDB (définissez un mot de passe root fort, supprimez les comptes anonymes et désactivez la connexion root à distance) :

```bash
sudo mysql_secure_installation
```

Connectez-vous au terminal MariaDB en tant que root pour créer la base de données et l'utilisateur dédié à l'application CAMA :

```bash
sudo mysql -u root -p
```

Exécutez les instructions SQL suivantes dans le terminal MariaDB :

```sql
-- Créer la base de données de la CAMA
CREATE DATABASE cama_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur spécifique pour plus de sécurité
CREATE USER 'cama_user'@'localhost' IDENTIFIED BY 'VOTRE_MOT_DE_PASSE_SECURISE';

-- Donner les privilèges d'accès à la base de données
GRANT ALL PRIVILEGES ON cama_db.* TO 'cama_user'@'localhost';

-- Appliquer les changements et quitter
FLUSH PRIVILEGES;
EXIT;
```

---

## 📂 Étape 4 : Déploiement du projet sur le serveur

Il est recommandé de déployer l'application dans le répertoire `/var/www/cama` :

```bash
sudo mkdir -p /var/www/cama
sudo chown -R $USER:$USER /var/www/cama
cd /var/www/cama
```

Transférez vos fichiers du projet dans ce dossier (via Git, SFTP ou téléchargement direct), puis installez les dépendances du Frontend et compilez les fichiers statiques de production :

```bash
# Installation des packages du Frontend
npm install

# Build de production
npm run build
```
Les fichiers statiques du site web sont maintenant générés de manière optimale dans le dossier `/var/www/cama/dist`.

---

## ⚙️ Étape 5 : Configuration du Serveur Backend de la base de données

Allez dans le dossier `/var/www/cama/database_setup` pour préparer le serveur API d'arrière-plan.

### 1. Installation des dépendances et pilotes :
```bash
cd /var/www/cama/database_setup
npm install express cors dotenv
```

* **Si vous utilisez SQLite :**
  ```bash
  npm install sqlite3
  ```
* **Si vous utilisez MariaDB/MySQL :**
  ```bash
  npm install mysql2
  ```

### 2. Création et alimentation de la base de données :

* **Pour SQLite (Option A) :**
  ```bash
  sqlite3 cama.db < sqlite_setup.sql
  ```
* **Pour MariaDB (Option B) :**
  ```bash
  mysql -u cama_user -p cama_db < mariadb_setup.sql
  ```

### 3. Création du fichier de variables d'environnement (`.env`) :
Créez le fichier de configuration de l'API backend :
```bash
nano .env
```

**Pour SQLite :**
```env
PORT=5000
NODE_ENV=production
DB_TYPE=sqlite
SQLITE_DB_PATH=/var/www/cama/database_setup/cama.db
```

**Pour MariaDB :**
```env
PORT=5000
NODE_ENV=production
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306
DB_USER=cama_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE
DB_NAME=cama_db
```

---

## 🔁 Étape 6 : Démarrage du Backend avec PM2

Nous allons confier la gestion du serveur backend Node.js à **PM2** pour garantir qu'il s'exécute de façon autonome et redémarre au boot de Debian :

```bash
# Lancement de l'API
pm2 start local_server.js --name "cama-backend"

# Sauvegarde de la configuration actuelle de PM2
pm2 save

# Configuration du démarrage automatique au boot du système Debian
pm2 startup systemd
```
*(Suivez et copiez-collez l'unique ligne de commande de configuration générée à l'écran par PM2 pour finaliser l'enregistrement Systemd)*.

---

## 🌐 Étape 7 : Installation et Configuration de Nginx (Reverse Proxy & Static Server)

Installez le serveur HTTP Nginx :

```bash
sudo apt install -y nginx
```

Créez un fichier de configuration virtuelle pour le site web CAMA :

```bash
sudo nano /etc/nginx/sites-available/cama
```

Collez la configuration suivante en remplaçant `votre_domaine.bf` par votre adresse IP de serveur ou nom de domaine officiel :

```nginx
server {
    listen 80;
    server_name votre_domaine.bf www.votre_domaine.bf;

    # 1. Dossier Racine contenant le Frontend React compilé
    root /var/www/cama/dist;
    index index.html;

    # Gestion de l'historique de routage de React Router SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Proxy d'acheminement des requêtes API vers le serveur Backend Node.js
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sécurité supplémentaire : désactivation de l'affichage de la version Nginx
    server_tokens off;
}
```

Activez cette nouvelle configuration et redémarrez Nginx :

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/cama /etc/nginx/sites-enabled/

# Supprimer le site par défaut de Nginx (facultatif)
sudo rm /etc/nginx/sites-enabled/default

# Tester la syntaxe de configuration Nginx
sudo nginx -t

# Recharger Nginx
sudo systemctl restart nginx
```

---

## 🔒 Étape 8 : Configuration du Pare-feu (UFW) et Sécurité SSL

Activez un pare-feu minimaliste pour sécuriser les ports réseau non désirés :

```bash
# Autoriser les connexions SSH sécurisées
sudo ufw allow OpenSSH

# Autoriser les protocoles HTTP et HTTPS (Nginx)
sudo ufw allow 'Nginx Full'

# Activer le pare-feu
sudo ufw enable
```

### Installation du certificat SSL gratuit Let's Encrypt (Recommandé) :

Pour chiffrer l'ensemble des données d'enrôlement médical transitant par le réseau, installez l'outil `certbot` de Let's Encrypt :

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Générez et installez automatiquement le certificat de chiffrement SSL sur Nginx :

```bash
sudo certbot --nginx -d votre_domaine.bf -d www.votre_domaine.bf
```
*(Suivez les étapes, entrez une adresse e-mail d'administration et acceptez les redirections automatiques du trafic non chiffré HTTP vers HTTPS).*

---

## 📊 Commandes de Maintenance utiles sous Debian

Voici les commandes quotidiennes indispensables pour surveiller et administrer votre serveur :

* **Surveiller les logs et erreurs de l'API Backend :**
  ```bash
  pm2 logs cama-backend
  ```
* **Vérifier l'utilisation CPU/Mémoire en temps réel de l'API :**
  ```bash
  pm2 monit
  ```
* **Redémarrer le serveur API Backend :**
  ```bash
  pm2 restart cama-backend
  ```
* **Consulter les journaux d'erreurs Nginx :**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
* **Vérifier le statut du serveur de base de données MariaDB :**
  ```bash
  sudo systemctl status mariadb
  ```
