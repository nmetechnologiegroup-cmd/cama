# 🛡️ GUIDE COMPLET DE DÉPLOIEMENT LOCAL — CAMA BURKINA FASO

Ce guide vous explique pas à pas comment installer, configurer et exécuter l'application de la **Caisse d'Assurance Maladie des Armées (CAMA)** en local sur votre ordinateur, avec une base de données **SQLite** ou **MariaDB / MySQL**.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre ordinateur :
1. **Node.js** (Version 18 ou supérieure recommandée) -> [Télécharger Node.js](https://nodejs.org/)
2. Un gestionnaire de base de données (au choix) :
   * **Pour SQLite (Recommandé - Simple et Rapide) :** Aucun serveur requis, SQLite est intégré à Node.js.
   * **Pour MariaDB / MySQL :** Un outil comme [XAMPP](https://www.apachefriends.org/), [WampServer](https://www.wampserver.com/), ou Docker.

---

## 📁 Étape 1 : Téléchargement et structure du projet

Exportez ou téléchargez les fichiers du projet depuis la plateforme. La structure des fichiers liés à la base de données est située dans le dossier `/database_setup` :

```text
cama-app/
├── database_setup/
│   ├── sqlite_setup.sql      # Script de structure et données initiales pour SQLite
│   ├── mariadb_setup.sql     # Script de structure et données initiales pour MariaDB/MySQL
│   ├── local_server.js       # Serveur API Backend en Node.js (Express)
│   └── README.md             # Guide rapide de configuration de la base de données
├── src/                      # Code source du site web React (Frontend)
├── package.json              # Dépendances de l'application React
├── vite.config.ts            # Configuration de Vite
└── DEPLOYMENT.md             # Ce guide complet de déploiement
```

---

## 🗄️ Étape 2 : Configuration de la Base de Données

Vous avez le choix entre deux systèmes de base de données pré-configurés avec l'exactitude de toutes les données du site en ligne (mêmes photos, actualités, comptes et configurations d'accueil) :

### OPTION A : Déploiement avec SQLite (Le plus simple, aucun serveur requis)

SQLite utilise un simple fichier local.

1. Allez dans le dossier `database_setup` :
   ```bash
   cd database_setup
   ```
2. Créez un fichier de base de données vide nommé `cama.db` ou laissez le script le générer.
3. Importez la structure et les données d'origine avec l'utilitaire SQLite :
   * **Sur Windows (PowerShell/CMD) :**
     ```bash
     sqlite3 cama.db ".read sqlite_setup.sql"
     ```
   * **Sur Linux / macOS (Terminal) :**
     ```bash
     sqlite3 cama.db < sqlite_setup.sql
     ```
   *(Vous pouvez également utiliser un outil visuel gratuit comme [DB Browser for SQLite](https://sqlitebrowser.org/) pour ouvrir `cama.db` et y importer le fichier `sqlite_setup.sql`).*

---

### OPTION B : Déploiement avec MariaDB ou MySQL

1. Lancez votre serveur local MySQL/MariaDB (via XAMPP, WampServer, MAMP ou Docker).
2. Connectez-vous à votre console de gestion (ex: phpMyAdmin ou DBeaver) et créez une base de données vide nommée `cama_db` avec un encodage UTF-8 :
   ```sql
   CREATE DATABASE cama_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Exécutez le script SQL d'initialisation des tables dans votre nouvelle base de données `cama_db` :
   ```bash
   mysql -u root -p cama_db < database_setup/mariadb_setup.sql
   ```
4. Injectez le jeu complet de données de production (contenant tous les utilisateurs de test, les actualités, la configuration du site et la **Foire Aux Questions (FAQ)** réactivée) :
   ```bash
   mysql -u root -p cama_db < database_setup/mariadb_data_dump.sql
   ```

---

## ⚙️ Étape 3 : Configuration du fichier d'environnement du Serveur Backend

Dans le dossier `/database_setup`, créez un fichier nommé **`.env`** pour indiquer au serveur de données quel pilote et quels accès utiliser.

### Configuration pour SQLite (Copier-Coller dans `.env`) :
```env
PORT=5000
NODE_ENV=development
DB_TYPE=sqlite
SQLITE_DB_PATH=cama.db
```

### Configuration pour MariaDB / MySQL (Copier-Coller dans `.env`) :
```env
PORT=5000
NODE_ENV=development
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_ici
DB_NAME=cama_db
```

---

## 🚀 Étape 4 : Lancement du Serveur Backend

Le serveur backend fait le lien entre votre base de données et le site web React.

1. Ouvrez un terminal dans le dossier `/database_setup` :
   ```bash
   cd database_setup
   ```
2. Installez les paquets de dépendances requis pour l'exécution du serveur :
   ```bash
   npm install express cors dotenv
   ```
3. Installez le pilote de base de données selon votre option choisie à l'étape 2 :
   * **Si vous utilisez SQLite (Option A) :**
     ```bash
     npm install sqlite3
     ```
   * **Si vous utilisez MariaDB/MySQL (Option B) :**
     ```bash
     npm install mysql2
     ```
4. Démarrez le serveur :
   ```bash
   node local_server.js
   ```
   *Le message suivant doit s'afficher :*
   `Serveur local CAMA démarré avec succès sur le port 5000`
   `Type de base de données active : SQLITE` (ou MARIADB)

---

## 🌐 Étape 5 : Lancement de l'Application Frontend (React)

Maintenant que votre backend et votre base de données tournent en local, lancez l'application web.

1. Ouvrez un **nouveau terminal** à la racine du projet `/` :
   ```bash
   npm install
   ```
2. Lancez l'application en mode de développement :
   ```bash
   npm run dev
   ```
3. Ouvrez votre navigateur et accédez à l'adresse indiquée par Vite (généralement `http://localhost:3000` ou `http://localhost:5173`).

---

## 🔑 Identifiants de connexion pré-configurés pour vos tests

Le site local contient l'exactitude des données et comptes suivants prêts pour la connexion :

### 💂 Comptes Militaires (Espace Assuré - Suivi d'enrôlement et Fiche Militaire) :
* **Compte 1 :** `i.kabore@armee.bf` | Mot de passe : `password123` *(Statut : Actif)*
* **Compte 2 :** `y.diallo@armee.bf` | Mot de passe : `password123` *(Statut : Actif)*

### 💻 Comptes d'Administration (Supervision, Validation des Dossiers et Administration du site) :
* **Super Administrateur (Accès total) :** `superadmin@cama.bf` | Mot de passe : `password123`
* **Gestionnaire des Dossiers (Validation) :** `gestionnaire@cama.bf` | Mot de passe : `password123`
* **Éditeur d'Actualités (Publications) :** `editeur@cama.bf` | Mot de passe : `password123`

---

## 🔄 Étape 6 : Connexion complète du Frontend React au Backend local

Actuellement, l'application React utilise un mécanisme de persistance réactive `localStorage` intégrée pour être 100% fonctionnelle en mode de démonstration sans serveur.

Pour basculer définitivement sur votre base de données SQLite ou MariaDB locale, vous pouvez remplacer les appels d'écriture dans `src/lib/dataStore.ts` par des appels HTTP standards vers votre serveur local `http://localhost:5000/api`.

### Exemple de conversion de code pour récupérer les actualités depuis la base de données :

```typescript
// Dans src/lib/dataStore.ts
export async function getLocalArticles() {
  try {
    const response = await fetch('http://localhost:5000/api/articles');
    return await response.json();
  } catch (error) {
    console.error("Erreur de récupération SQLite/MariaDB", error);
    // Fallback sur le store local si le serveur est éteint
    return initialArticles;
  }
}
```

---
*Ceci conclut le guide de déploiement. Pour toute question de configuration réseau ou d'hébergement cloud, référez-vous au département informatique de la CAMA.*
