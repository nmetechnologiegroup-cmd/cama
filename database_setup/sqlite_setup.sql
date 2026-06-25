-- Script d'initialisation de la base de données SQLite pour CAMA
-- Ce script crée toutes les tables nécessaires et les peuple avec les données initiales de l'application.

-- Suppression des tables si elles existent
DROP TABLE IF EXISTS action_logs;
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS centres;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS users;

-- 1. Table des UTILISATEURS (Militaires)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    matricule TEXT UNIQUE NOT NULL,
    corp TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT 'password123',
    status TEXT NOT NULL DEFAULT 'Actif',
    phone TEXT,
    address TEXT,
    prenoms TEXT,
    sexe TEXT CHECK(sexe IN ('M', 'F')) DEFAULT 'M',
    num_informatique TEXT,
    grade TEXT,
    categorie TEXT,
    num_cim TEXT,
    num_carte_cama TEXT,
    num_iup TEXT,
    struct_armee TEXT,
    struct_region TEXT,
    struct_corps TEXT,
    struct_service TEXT,
    struct_section TEXT,
    struct_sous_section TEXT,
    telephones TEXT,
    personne_a_prevenir TEXT,
    personne_a_prevenir_tel TEXT
);

-- 2. Table des DOSSIERS / DEMANDES (Requests)
CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    assure TEXT NOT NULL,
    matricule TEXT NOT NULL,
    membre TEXT NOT NULL,
    prenoms TEXT,
    sexe TEXT CHECK(sexe IN ('M', 'F')),
    date_naissance TEXT,
    lieu_naissance TEXT,
    gs TEXT,
    ref_identity_doc TEXT,
    ref_marriage_certificate TEXT,
    ref_scolarite_doc TEXT,
    mother_name TEXT,
    profession TEXT,
    residence TEXT,
    telephone TEXT,
    lien TEXT NOT NULL, -- Conjoint, Enfant, Parent, Autre
    date TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'En attente', -- En attente, Validé, Rejeté
    num_informatique TEXT,
    num_cama TEXT,
    justificatif TEXT,
    rejection_reason TEXT,
    document_image TEXT,
    user_id INTEGER,
    email_notification_sent INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Table des ADMINISTRATEURS
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Actif',
    role TEXT NOT NULL, -- Super Admin, Gestionnaire Dossiers, Éditeur Actualités, Responsable Réseau
    permissions TEXT NOT NULL, -- Stocké sous forme de chaîne JSON (ex: '["dossiers", "centres"]')
    created_date TEXT NOT NULL
);

-- 4. Table des CENTRES DE SANTÉ CONVENTIONNÉS
CREATE TABLE centres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    ville TEXT NOT NULL,
    type TEXT NOT NULL -- Public, Privé Conventionné, Pharmacie
);

-- 5. Table des ARTICLES (Actualités)
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Publié', -- Publié, Brouillon
    author TEXT NOT NULL,
    category TEXT,
    content TEXT,
    image TEXT
);

-- 6. Table de CONFIGURATION DU SITE WEB (Site Settings)
CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Assure qu'il n'y a qu'une seule ligne de configuration
    popup_title TEXT,
    popup_subtitle TEXT,
    popup_content TEXT,
    popup_active INTEGER DEFAULT 1,
    popup_image TEXT,
    popup_max_views INTEGER DEFAULT 2,
    hero_bg_watermark_opacity INTEGER DEFAULT 25,
    prestations TEXT, -- JSON array
    dg_name TEXT,
    dg_message TEXT,
    dg_citation TEXT,
    dg_image TEXT,
    about_content TEXT, -- JSON object
    statistics TEXT, -- JSON array
    facebook_page_url TEXT,
    quality_citation TEXT,
    quality_author TEXT,
    testimonials TEXT, -- JSON array
    partners TEXT, -- JSON array
    hero_image TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    menu_visibility TEXT, -- JSON object
    section_titles TEXT, -- JSON object
    footer TEXT -- JSON object
);

-- 7. Table des JOURNAUX D'ACTIONS (Action Logs)
CREATE TABLE action_logs (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ========================================================
-- SEEDING DATA (Insertion des données d'origine et photos)
-- ========================================================

-- Insertion des utilisateurs par défaut (Mot de passe d'origine : password123)
INSERT INTO users (id, name, matricule, corp, email, password, status) VALUES 
(1, 'KABORE Idrissa', 'M-5421', 'Armée de Terre', 'i.kabore@armee.bf', 'password123', 'Actif'),
(2, 'DIALLO Yaya', 'M-8832', 'Gendarmerie Nationale', 'y.diallo@armee.bf', 'password123', 'Actif'),
(3, 'TRAORE Aïcha', 'M-1129', 'Armée de l''Air', 'a.traore@armee.bf', 'password123', 'Inactif');

-- Insertion des demandes / dossiers d'enrôlement
INSERT INTO requests (id, assure, matricule, membre, lien, date, statut, user_id) VALUES 
('1021', 'KABORE Idrissa', 'M-5421', 'KABORE Alimata', 'Conjoint', '21 Juin 2026', 'En attente', 1),
('1022', 'DIALLO Yaya', 'M-8832', 'DIALLO Oumar', 'Enfant', '20 Juin 2026', 'Validé', 2),
('1023', 'TRAORE Aïcha', 'M-1129', 'TRAORE Fanta', 'Parent', '18 Juin 2026', 'En attente', 3),
('1024', 'COMPAORE Seydou', 'M-3004', 'COMPAORE Abdoul', 'Enfant', '15 Juin 2026', 'Rejeté', NULL),
('1025', 'OUEDRAOGO Paul', 'M-4201', 'OUEDRAOGO Marie', 'Conjoint', '14 Juin 2026', 'Validé', NULL);

-- Insertion des administrateurs
INSERT INTO admin_users (id, name, email, status, role, permissions, created_date) VALUES 
(1, 'Général de Brigade Lassane', 'superadmin@cama.bf', 'Actif', 'Super Admin', '["site_settings","dossiers","users","centres","news","settings"]', '12 Janvier 2026'),
(2, 'Colonel Commandant Sanou', 'gestionnaire@cama.bf', 'Actif', 'Gestionnaire Dossiers', '["dossiers","centres"]', '18 Février 2026'),
(3, 'Capitaine Sawadogo', 'editeur@cama.bf', 'Actif', 'Éditeur Actualités', '["news","site_settings"]', '01 Avril 2026');

-- Insertion des centres médicaux conventionnés
INSERT INTO centres (id, nom, ville, type) VALUES 
(1, 'Centre Médical Camp Guillaume', 'Ouagadougou', 'Public'),
(2, 'Clinique Notre Dame de la Paix', 'Ouagadougou', 'Privé Conventionné'),
(3, 'Pharmacie de la Nation', 'Bobo-Dioulasso', 'Pharmacie'),
(4, 'Hôpital Militaire', 'Ouagadougou', 'Public');

-- Insertion des actualités (Articles avec images d'origine)
INSERT INTO articles (id, title, date, status, author, category, content, image) VALUES 
(1, 'Lancement officiel de la plateforme', '18 Juin 2026', 'Publié', 'Communication', 'Événement Majeur', 'Sous la Présidence du Ministre d’Etat, Ministre de la Défense, lancement officiel des activités de la CAMA. Découvrez les fiches d''enrôlement et bénéficiez de vos prises en charge.', 'https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=600&auto=format&fit=crop'),
(2, 'Ajout de 15 nouvelles cliniques au réseau', '10 Juin 2026', 'Publié', 'Dir. Santé', 'Réseau Santé', 'Afin de garantir un meilleur maillage territorial, la CAMA étend son réseau de soins partenaires dans tout le pays. De nouvelles structures ont signé des conventions de partenariat.', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop'),
(3, 'Campagne de vaccination gratuite au Camp', '02 Juin 2026', 'Brouillon', 'Communication', 'Santé Publique', 'Campagne élargie de vaccination contre l''hépatite et les maladies saisonnières. Réservé aux assurés et membres de famille.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop');

-- Insertion de la configuration du site (Site Settings)
INSERT INTO site_settings (
    id, 
    popup_title, 
    popup_subtitle, 
    popup_content, 
    popup_active, 
    popup_image, 
    popup_max_views, 
    hero_bg_watermark_opacity,
    prestations, 
    dg_name, 
    dg_message, 
    dg_citation, 
    dg_image, 
    about_content, 
    statistics, 
    facebook_page_url, 
    quality_citation, 
    quality_author, 
    testimonials, 
    partners, 
    hero_image, 
    hero_title, 
    hero_subtitle, 
    menu_visibility, 
    section_titles, 
    footer
) VALUES (
    1,
    'La CAMA officiellement lancée !',
    'La santé de nos héros, notre priorité.',
    'La CAMA, soucieuse du bien-être des soldats engagés dans la lutte, vient à point nommé étendre ses services à la famille de nos forces armées nationales. Découvrez le nouveau portail de gestion de vos prestations.',
    1,
    'https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=2070&auto=format&fit=crop',
    2,
    25,
    '[{"title":"Prise en charge médicale","label":"Prestation 01","desc":"Vous êtes assurés, bénéficie d''une prise en charge médicale dans nos centres conventionnés pour vous et votre famille avec une gestion rapide et efficace."},{"title":"Enrôlement des familles","label":"Prestation 02","desc":"Déclarez facilement vos ayants droit (conjoints, enfants, ascendants) via la plateforme numérique pour faciliter leur intégration dans le système de couverture."},{"title":"Couverture risques","label":"Prestation 03","desc":"Couverture des blessures en opération et risques professionnels. N''hésitez pas à prendre attache with nos services pour l''ouverture de votre dossier de suivi."}]',
    'Colonel-Major Saïdou YONABA',
    'Je vous souhaite chaleureusement la bienvenue sur notre site web. Cette institution, née de la ferme volonté de la hiérarchie militaire, s’est vue réalisée sous le leadership du Chef de l’Etat pour permettre aux militaires engagés au front ou non, de bénéficier d’une prise en charge sanitaire élargie à sa famille à travers un traitement solidaire et équitable.',
    'Bâtir une solidarité agissante au sein de nos forces.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    '{"heroTitle":"Notre Mission, Notre Identité","heroSubtitle":"La Caisse d''Assurance Maladie des Armées (CAMA) est l''institution de prévoyance sociale dédiée à garantir une couverture santé universelle et solidaire pour les forces armées burkinabè et leurs familles.","heroImage":"https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop","missionTitle":"Notre Mission","missionDesc":"Assurer la gestion du régime d''assurance maladie au profit des personnels des forces armées, de leurs familles et des retraités, en garantissant un accès équitable à des soins de santé de qualité.","visionTitle":"Notre Vision","visionDesc":"Devenir un pôle d''excellence en matière de sécurité sociale militaire dans la sous-région, soutenu par la digitalisation de nos services et la rigueur dans la gestion de nos prestations.","historyTitle":"Historique","historyDesc1":"Autrefois assurée par la Mutuelle des Forces Armées Nationales (MUFAN), la prise en charge sanitaire était destinée aux militaires uniquement. Face aux défis sécuritaires et soucieuse du bien-être des soldats engagés dans la lutte, la CAMA vient à point nommé étendre ses services à la famille de nos vaillantes forces.","historyDesc2":"« Cette institution, née de la ferme volonté de la hiérarchie militaire, s''est vue réalisée sous le leadership du Capitaine Ibrahim TRAORE, Président du Faso, Chef de l''Etat, pour permettre aux militaires de bénéficier d''une prise en charge élargie. » — Colonel-Major Saïdou YONABA.","historyImage":"https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop"}',
    '[{"id":"1","label":"Personnels Enrôlés","val":"54 219","iconType":"Users"},{"id":"2","label":"Ayants Droit Couverts","val":"112 943","iconType":"HeartPulse"},{"id":"3","label":"Centres Affiliés","val":"128","iconType":"MapPin"},{"id":"4","label":"Dossiers Traités","val":"45 600+","iconType":"Activity"}]',
    'https://facebook.com/CAMA_BF',
    '« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité »',
    'Mme Ouedraogo, bénéficiaire',
    '[{"id":"1","quote":"« Nous avons trouvé à la CAMA, un système efficace qui répond en tout point aux exigences de qualité de soins pour nos militaires. »","author":"Mme Ouedraogo","role":"Mère de famille & Bénéficiaire"},{"id":"2","quote":"« L''enrôlement en ligne est extrêmement rapide. J''ai pu inscrire mes ayants droit depuis chez moi avant mon déploiement sur le terrain. »","author":"Adjudant-Chef Diallo","role":"Militaire en activité"},{"id":"3","quote":"« Grâce aux accords de prise en charge instantanés de la CAMA, notre clinique accueille et soigne les soldats sans formalités fastidieuses. »","author":"Dr. Somé L.","role":"Médecin-Chef"}]',
    '[{"id":1,"name":"ISSA"},{"id":2,"name":"CIPRES"},{"id":3,"name":"OIT (ILO)"},{"id":4,"name":"BCEAO"}]',
    'https://images.unsplash.com/photo-1544257121-8178d46e33bd?q=80&w=2070&auto=format&fit=crop',
    'La santé de nos héros, notre priorité.',
    'La Caisse d''Assurance Maladie des Armées (CAMA) offre une prise en charge sanitaire élargie aux vaillants combattants des Forces Armées Nationales et à leurs familles.',
    '{"about":true,"services":true,"news":true,"contact":true}',
    '{"prestations":"Nos prestations","services":"Services en ligne"}',
    '{"copyright":"© 2026 CAMA Burkina Faso. Tous droits réservés.","liensRapides":[{"label":"Accueil","url":"/"},{"label":"Notre Mission","url":"/about"},{"label":"Catalogue des Services","url":"/services"},{"label":"Actualités","url":"/news"}],"espaceNumerique":[{"label":"Espace Assuré","url":"/login"},{"label":"Plateforme d''enrôlement","url":"/login"},{"label":"Portail Administrateur","url":"/login"},{"label":"Simulateur de prestations","url":"/services"}],"contactTitle":"Contactez-nous","address":"Camp Guillaume Ouédraogo, Ouagadougou, Burkina Faso","phone":"+226 25 00 00 00","email":"contact@cama.bf","description":"Caisse d''Assurance Maladie des Armées. Garantir une couverture santé universelle et solidaire pour nos forces armées et leurs familles.","badgeText":"La Patrie ou la Mort, nous vaincrons !"'
);
