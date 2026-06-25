# 🛡️ Guide de Déploiement Local avec Base de Données (SQLite / MariaDB)

Ce dossier contient tous les scripts SQL nécessaires et un serveur backend Node.js (Express) complet pour exécuter l'application CAMA en local sur votre machine avec une véritable persistance de données (au choix : **SQLite** ou **MariaDB / MySQL**).

Toutes les photos d'origine, le contenu rédigé, la configuration de l'accueil, les actualités et les comptes de démonstration (militaires et administrateurs) sont déjà inclus et pré-configurés !

---

## 📂 Contenu de ce dossier

1. **`sqlite_setup.sql`** : Script d'initialisation de la base de données **SQLite** avec la structure des tables et l'ensemble des données d'origine pré-remplies.
2. **`mariadb_setup.sql`** : Script d'initialisation de la base de données **MariaDB / MySQL** avec la structure des tables et l'ensemble des données d'origine pré-remplies.
3. **`local_server.js`** : Serveur backend Node.js (Express) léger et rapide qui gère l'ensemble des API de l'application en se connectant dynamiquement à SQLite ou MariaDB selon votre choix.

---

## 🚀 Étape 1 : Choix et configuration de la base de données

### Option A : Utilisation de SQLite (Recommandé pour sa simplicité, aucun serveur requis)

SQLite stocke toutes les données dans un seul fichier local.

1. Installez un client SQLite sur votre ordinateur si nécessaire (ex: [DB Browser for SQLite](https://sqlitebrowser.org/)), ou utilisez la ligne de commande.
2. Créez un fichier vide nommé `cama.db` dans ce dossier.
3. Importez et exécutez le script `sqlite_setup.sql` sur ce fichier de base de données.
   * *Via ligne de commande :*
     ```bash
     sqlite3 cama.db < sqlite_setup.sql
     ```
4. Votre fichier `cama.db` est désormais prêt et contient toutes les données de l'application !

---

### Option B : Utilisation de MariaDB / MySQL

1. Connectez-vous à votre serveur MariaDB / MySQL local (ex: via phpMyAdmin, DBeaver, ou la ligne de commande).
2. Créez une nouvelle base de données nommée `cama_db` :
   ```sql
   CREATE DATABASE cama_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Exécutez le script SQL `mariadb_setup.sql` dans cette base de données pour générer toutes les tables et insérer les données d'origine :
   ```bash
   mysql -u [votre_utilisateur] -p cama_db < mariadb_setup.sql
   ```

---

## ⚙️ Étape 2 : Configuration du fichier `.env`

Créez un fichier `.env` dans ce dossier `/database_setup` pour indiquer au serveur quelle base de données utiliser.

### Exemple de configuration pour SQLite :
```env
PORT=5000
NODE_ENV=development
DB_TYPE=sqlite
SQLITE_DB_PATH=cama.db
```

### Exemple de configuration pour MariaDB / MySQL :
```env
PORT=5000
NODE_ENV=development
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=cama_db
```

---

## 📦 Étape 3 : Lancement du serveur backend local

Le serveur Express va faire le pont entre l'application React et votre base de données.

1. Ouvrez votre terminal dans ce dossier `/database_setup` :
   ```bash
   cd database_setup
   ```
2. Installez les dépendances nécessaires au serveur :
   ```bash
   npm install express cors dotenv
   ```
   * *Si vous utilisez SQLite, installez aussi la dépendance SQLite :*
     ```bash
     npm install sqlite3
     ```
   * *Si vous utilisez MariaDB ou MySQL, installez aussi la dépendance MySQL :*
     ```bash
     npm install mysql2
     ```
3. Lancez le serveur local :
   ```bash
   node local_server.js
   ```
   Le message suivant doit s'afficher :
   `Serveur local CAMA démarré avec succès sur le port 5000`

---

## 🌐 Étape 4 : Adapter l'application Frontend React

Dans l'application React en local, vous pouvez connecter vos composants au serveur local à la place de `localStorage` de manière très simple !

Dans vos composants React ou dans vos requêtes d'API, il vous suffit de modifier vos appels pour pointer vers l'adresse du serveur backend : `http://localhost:5000/api`.

### Exemple de fonction pour récupérer les actualités depuis la base de données :
```javascript
// Exemple de fonction de récupération
async function fetchArticles() {
  try {
    const response = await fetch('http://localhost:5000/api/articles');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
  }
}
```

---

## 🔑 Identifiants d'accès par défaut (dans les Scripts SQL)

Une fois la base de données installée, vous pouvez tester l'application avec ces comptes d'origine :

### 👮 Comptes Militaires (Espace Assuré) :
* **Compte 1 :** `i.kabore@armee.bf` (Matricule : `M-5421`) | Mot de passe : `password123`
* **Compte 2 :** `y.diallo@armee.bf` (Matricule : `M-8832`) | Mot de passe : `password123`

### 💻 Comptes Administratifs (Espace Administration) :
* **Super Admin :** `superadmin@cama.bf` | Mot de passe : `password123`
* **Gestionnaire Dossiers :** `gestionnaire@cama.bf` | Mot de passe : `password123`
* **Éditeur Actualités :** `editeur@cama.bf` | Mot de passe : `password123`
