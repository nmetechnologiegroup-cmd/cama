# Portail CAMA (Caisse d'Assurance Maladie des Armées)

Bienvenue sur le dépôt du frontend React/Vite pour le portail CAMA. Ce projet constitue le prototype fonctionnel interactif de l'application, développé avec React, TypeScript et Tailwind CSS.

## 🚀 Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- `npm` ou `yarn`

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-utilisateur/cama-frontend.git
   cd cama-frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Variables d'environnement**
   Copiez le fichier `.env.example` vers `.env` (si nécessaire pour votre configuration locale) :
   ```bash
   cp .env.example .env
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

## 🛠️ Technologies Utilisées

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS** (v4)
- **React Router** (v7)
- **Lucide React** (Icônes)
- **Framer Motion** (Animations)
- **Recharts** (Graphiques et tableaux de bord)

## 📁 Structure du Projet

```text
├── src/
│   ├── components/      # Composants réutilisables (Navbar, Footer, etc.)
│   ├── layouts/         # Layouts de l'application (MainLayout, AdminLayout)
│   ├── lib/             # Utilitaires, contextes (Thème, Langue), store local
│   ├── pages/           # Vues/Pages (Accueil, Dashboard, Admin, etc.)
│   ├── assets/          # Images et ressources statiques
│   ├── App.tsx          # Point d'entrée du routeur
│   └── main.tsx         # Point de montage React
├── index.html           # Template HTML principal
├── vite.config.ts       # Configuration Vite
├── tailwind.config.ts   # Configuration Tailwind (intégrée via Vite/v4)
└── package.json         # Dépendances et scripts NPM
```

## 📦 Scripts Disponibles

- `npm run dev` : Lance le serveur de développement local.
- `npm run build` : Construit l'application pour la production dans le dossier `dist/`.
- `npm run preview` : Prévisualise la version de production en local.
- `npm run lint` : Vérifie les erreurs TypeScript.

## 📋 Note sur l'Architecture Backend (PHP/MySQL)

Si vous devez connecter ce frontend à un backend PHP/MySQL (architecture MVC), vous trouverez les scripts SQL et des guides de déploiement dans le dossier `database_setup/` et les fichiers `DEPLOYMENT.md` / `DEPLOYMENT_DEBIAN.md`.

## 🛡️ Licence

Ce projet est la propriété de la Caisse d'Assurance Maladie des Armées (CAMA). Tous droits réservés.
