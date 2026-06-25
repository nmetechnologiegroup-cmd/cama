/**
 * Serveur Backend Local pour la CAMA
 * Ce serveur utilise Express.js et supporte SQLite et MariaDB/MySQL comme base de données.
 * Vous pouvez facilement changer de base de données via les variables d'environnement.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Chargement des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Type de base de données : 'sqlite' (par défaut) ou 'mariadb'
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

let db = null;

// Initialisation de la connexion à la base de données
if (DB_TYPE === 'sqlite') {
  console.log('--- Initialisation de la base de données SQLite ---');
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, process.env.SQLITE_DB_PATH || 'cama.db');
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erreur de connexion à SQLite:', err.message);
    } else {
      console.log('Connecté à la base de données SQLite avec succès.');
    }
  });

  // Helper pour exécuter des requêtes SQLite (promisifié)
  db.allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };

  db.getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  };

  db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  };

} else if (DB_TYPE === 'mariadb' || DB_TYPE === 'mysql') {
  console.log('--- Initialisation de la base de données MariaDB/MySQL ---');
  const mysql = require('mysql2/promise');
  
  // Création du pool de connexion
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cama_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Adapter l'API pour qu'elle soit similaire
  db = {
    async allAsync(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },
    async getAsync(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    },
    async runAsync(sql, params = []) {
      const [result] = await pool.execute(sql, params);
      return { id: result.insertId, changes: result.affectedRows };
    }
  };
  console.log('Pool de connexion MariaDB/MySQL configuré avec succès.');
}

// ==========================================
// ENDPOINTS API
// ==========================================

// 1. UTILISATEURS (Militaires)
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.allAsync('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const u = req.body;
  try {
    const sql = `
      INSERT INTO users (name, matricule, corp, email, password, status, phone, address, prenoms, sexe, num_informatique, grade, categorie, num_cim, num_carte_cama, num_iup, struct_armee, struct_region, struct_corps, struct_service, struct_section, struct_sous_section, telephones, personne_a_prevenir, personne_a_prevenir_tel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      u.name, u.matricule, u.corp, u.email, u.password || 'password123', u.status || 'Actif',
      u.phone, u.address, u.prenoms, u.sexe || 'M', u.num_informatique, u.grade, u.categorie,
      u.num_cim, u.num_carte_cama, u.num_iup, u.struct_armee, u.struct_region, u.struct_corps,
      u.struct_service, u.struct_section, u.struct_sous_section, u.telephones, u.personne_a_prevenir, u.personne_a_prevenir_tel
    ];
    const result = await db.runAsync(sql, params);
    res.status(201).json({ id: result.id, message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const u = req.body;
  try {
    const sql = `
      UPDATE users SET 
        name = ?, corp = ?, email = ?, status = ?, phone = ?, address = ?, prenoms = ?, sexe = ?,
        num_informatique = ?, grade = ?, categorie = ?, num_cim = ?, num_carte_cama = ?, num_iup = ?,
        struct_armee = ?, struct_region = ?, struct_corps = ?, struct_service = ?, struct_section = ?, struct_sous_section = ?,
        telephones = ?, personne_a_prevenir = ?, personne_a_prevenir_tel = ?
      WHERE id = ?
    `;
    const params = [
      u.name, u.corp, u.email, u.status, u.phone, u.address, u.prenoms, u.sexe,
      u.num_informatique, u.grade, u.categorie, u.num_cim, u.num_carte_cama, u.num_iup,
      u.struct_armee, u.struct_region, u.struct_corps, u.struct_service, u.struct_section, u.struct_sous_section,
      u.telephones, u.personne_a_prevenir, u.personne_a_prevenir_tel, req.params.id
    ];
    await db.runAsync(sql, params);
    res.json({ message: 'Utilisateur mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. DEMANDES / DOSSIERS (Requests)
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await db.allAsync('SELECT * FROM requests');
    // Normaliser les clés de camelCase si besoin pour le frontend
    const mapped = requests.map(r => ({
      id: r.id,
      assure: r.assure,
      matricule: r.matricule,
      membre: r.membre,
      prenoms: r.prenoms,
      sexe: r.sexe,
      dateNaissance: r.date_naissance,
      lieuNaissance: r.lieu_naissance,
      gs: r.gs,
      refIdentityDoc: r.ref_identity_doc,
      refMarriageCertificate: r.ref_marriage_certificate,
      refScolariteDoc: r.ref_scolarite_doc,
      motherName: r.mother_name,
      profession: r.profession,
      residence: r.residence,
      telephone: r.telephone,
      lien: r.lien,
      date: r.date,
      statut: r.statut,
      numInformatique: r.num_informatique,
      numCama: r.num_cama,
      justificatif: r.justificatif,
      rejectionReason: r.rejection_reason,
      documentImage: r.document_image,
      userId: r.user_id,
      emailNotificationSent: Boolean(r.email_notification_sent)
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/requests', async (req, res) => {
  const r = req.body;
  try {
    const sql = `
      INSERT INTO requests (id, assure, matricule, membre, prenoms, sexe, date_naissance, lieu_naissance, gs, ref_identity_doc, ref_marriage_certificate, ref_scolarite_doc, mother_name, profession, residence, telephone, lien, date, statut, num_informatique, num_cama, justificatif, rejection_reason, document_image, user_id, email_notification_sent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      r.id, r.assure, r.matricule, r.membre, r.prenoms, r.sexe, r.dateNaissance, r.lieuNaissance, r.gs,
      r.refIdentityDoc, r.refMarriageCertificate, r.refScolariteDoc, r.motherName, r.profession, r.residence,
      r.telephone, r.lien, r.date, r.statut || 'En attente', r.numInformatique, r.numCama, r.justificatif, r.rejectionReason,
      r.documentImage, r.userId, r.emailNotificationSent ? 1 : 0
    ];
    await db.runAsync(sql, params);
    res.status(201).json({ message: 'Dossier créé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  const r = req.body;
  try {
    const sql = `
      UPDATE requests SET 
        assure = ?, matricule = ?, membre = ?, prenoms = ?, sexe = ?, date_naissance = ?, lieu_naissance = ?, 
        gs = ?, ref_identity_doc = ?, ref_marriage_certificate = ?, ref_scolarite_doc = ?, mother_name = ?, 
        profession = ?, residence = ?, telephone = ?, lien = ?, date = ?, statut = ?, num_informatique = ?, 
        num_cama = ?, justificatif = ?, rejection_reason = ?, document_image = ?, user_id = ?, email_notification_sent = ?
      WHERE id = ?
    `;
    const params = [
      r.assure, r.matricule, r.membre, r.prenoms, r.sexe, r.dateNaissance, r.lieuNaissance,
      r.gs, r.refIdentityDoc, r.refMarriageCertificate, r.refScolariteDoc, r.motherName,
      r.profession, r.residence, r.telephone, r.lien, r.date, r.statut, r.numInformatique,
      r.numCama, r.justificatif, r.rejectionReason, r.documentImage, r.userId, r.emailNotificationSent ? 1 : 0,
      req.params.id
    ];
    await db.runAsync(sql, params);
    res.json({ message: 'Dossier mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM requests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Dossier supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. CENTRES CONVENTIONNÉS
app.get('/api/centres', async (req, res) => {
  try {
    const centres = await db.allAsync('SELECT * FROM centres');
    res.json(centres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/centres', async (req, res) => {
  const c = req.body;
  try {
    const result = await db.runAsync('INSERT INTO centres (nom, ville, type) VALUES (?, ?, ?)', [c.nom, c.ville, c.type]);
    res.status(201).json({ id: result.id, message: 'Centre ajouté avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/centres/:id', async (req, res) => {
  const c = req.body;
  try {
    await db.runAsync('UPDATE centres SET nom = ?, ville = ?, type = ? WHERE id = ?', [c.nom, c.ville, c.type, req.params.id]);
    res.json({ message: 'Centre mis à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/centres/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM centres WHERE id = ?', [req.params.id]);
    res.json({ message: 'Centre supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ACTUALITÉS (Articles)
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await db.allAsync('SELECT * FROM articles ORDER BY id DESC');
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/articles', async (req, res) => {
  const a = req.body;
  try {
    const result = await db.runAsync(
      'INSERT INTO articles (title, date, status, author, category, content, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [a.title, a.date, a.status || 'Publié', a.author, a.category, a.content, a.image]
    );
    res.status(201).json({ id: result.id, message: 'Actualité publiée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/articles/:id', async (req, res) => {
  const a = req.body;
  try {
    await db.runAsync(
      'UPDATE articles SET title = ?, date = ?, status = ?, author = ?, category = ?, content = ?, image = ? WHERE id = ?',
      [a.title, a.date, a.status, a.author, a.category, a.content, a.image, req.params.id]
    );
    res.json({ message: 'Actualité mise à jour avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/articles/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Actualité supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. SITE SETTINGS (Configuration)
app.get('/api/site-settings', async (req, res) => {
  try {
    const row = await db.getAsync('SELECT * FROM site_settings WHERE id = 1');
    if (!row) return res.status(404).json({ error: 'Configuration introuvable.' });
    
    // Convertir les colonnes JSON textuelles en objets/tableaux JSON
    const settings = {
      popupTitle: row.popup_title,
      popupSubtitle: row.popup_subtitle,
      popupContent: row.popup_content,
      popupActive: Boolean(row.popup_active),
      popupImage: row.popup_image,
      popupMaxViews: row.popup_max_views,
      heroBgWatermarkOpacity: row.hero_bg_watermark_opacity,
      prestations: JSON.parse(row.prestations || '[]'),
      dgName: row.dg_name,
      dgMessage: row.dg_message,
      dgCitation: row.dg_citation,
      dgImage: row.dg_image,
      aboutContent: JSON.parse(row.about_content || '{}'),
      statistics: JSON.parse(row.statistics || '[]'),
      facebookPageUrl: row.facebook_page_url,
      qualityCitation: row.quality_citation,
      qualityAuthor: row.quality_author,
      testimonials: JSON.parse(row.testimonials || '[]'),
      partners: JSON.parse(row.partners || '[]'),
      heroImage: row.hero_image,
      heroTitle: row.hero_title,
      heroSubtitle: row.hero_subtitle,
      menuVisibility: JSON.parse(row.menu_visibility || '{}'),
      sectionTitles: JSON.parse(row.section_titles || '{}'),
      footer: JSON.parse(row.footer || '{}')
    };
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/site-settings', async (req, res) => {
  const s = req.body;
  try {
    const sql = `
      UPDATE site_settings SET 
        popup_title = ?, popup_subtitle = ?, popup_content = ?, popup_active = ?, popup_image = ?, popup_max_views = ?, 
        hero_bg_watermark_opacity = ?, prestations = ?, dg_name = ?, dg_message = ?, dg_citation = ?, dg_image = ?, 
        about_content = ?, statistics = ?, facebook_page_url = ?, quality_citation = ?, quality_author = ?, 
        testimonials = ?, partners = ?, hero_image = ?, hero_title = ?, hero_subtitle = ?, menu_visibility = ?, 
        section_titles = ?, footer = ?
      WHERE id = 1
    `;
    const params = [
      s.popupTitle, s.popupSubtitle, s.popupContent, s.popupActive ? 1 : 0, s.popupImage, s.popupMaxViews,
      s.heroBgWatermarkOpacity, JSON.stringify(s.prestations || []), s.dgName, s.dgMessage, s.dgCitation, s.dgImage,
      JSON.stringify(s.aboutContent || {}), JSON.stringify(s.statistics || []), s.facebookPageUrl, s.qualityCitation, s.qualityAuthor,
      JSON.stringify(s.testimonials || []), JSON.stringify(s.partners || []), s.heroImage, s.heroTitle, s.heroSubtitle,
      JSON.stringify(s.menuVisibility || {}), JSON.stringify(s.sectionTitles || {}), JSON.stringify(s.footer || {})
    ];
    await db.runAsync(sql, params);
    res.json({ message: 'Configuration du site mise à jour.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. ACTION LOGS
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await db.allAsync('SELECT * FROM action_logs ORDER BY date DESC');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs', async (req, res) => {
  const l = req.body;
  try {
    const id = Math.random().toString(36).substr(2, 9);
    const dateStr = new Date().toLocaleString('fr-FR');
    await db.runAsync(
      'INSERT INTO action_logs (id, user_id, action, date) VALUES (?, ?, ?, ?)',
      [id, l.userId, l.action, dateStr]
    );
    res.status(201).json({ message: 'Action enregistrée.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Servir les fichiers statiques de production si compilé
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur local CAMA démarré avec succès sur le port ${PORT}`);
  console.log(`Type de base de données active : ${DB_TYPE.toUpperCase()}`);
});
