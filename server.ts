import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  const safeParse = (val: any, fallback: any = []) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      return fallback;
    }
  };

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  let dbType = process.env.DB_TYPE || 'sqlite';
  let sqliteDb: any = null;
  let mysqlPool: mysql.Pool | null = null;

  if (dbType === 'mariadb' || dbType === 'mysql') {
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cama_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Connecté à la base de données MariaDB/MySQL avec succès.');
  } else {
    // Initialize SQLite database
    const dbPath = path.resolve(process.cwd(), process.env.SQLITE_DB_PATH || 'cama.db');
    try {
      sqliteDb = new Database(dbPath);
      console.log('Connecté à la base de données SQLite avec succès.');
    } catch (err: any) {
      console.error('Erreur de connexion à SQLite:', err.message);
    }
  }

  // Helper for promisified queries (unified interface)
  const dbAll = async (sql: string, params: any[] = []): Promise<any[]> => {
    if (mysqlPool) {
      const [rows] = await mysqlPool.execute(sql.replace(/\?/g, '?'), params);
      return rows as any[];
    }
    return sqliteDb.prepare(sql).all(params);
  };

  const dbGet = async (sql: string, params: any[] = []): Promise<any> => {
    if (mysqlPool) {
      const [rows] = await mysqlPool.execute(sql.replace(/\?/g, '?'), params);
      const rowsArray = rows as any[];
      return rowsArray.length > 0 ? rowsArray[0] : undefined;
    }
    return sqliteDb.prepare(sql).get(params);
  };

  const dbRun = async (sql: string, params: any[] = []): Promise<{ id: number; changes: number }> => {
    if (mysqlPool) {
      const [result] = await mysqlPool.execute(sql.replace(/\?/g, '?'), params);
      const res = result as mysql.ResultSetHeader;
      return { id: res.insertId, changes: res.affectedRows };
    }
    const info = sqliteDb.prepare(sql).run(params);
    return { id: info.lastInsertRowid as number, changes: info.changes };
  };

  // Seed database if empty
  try {
    const checkSql = mysqlPool 
      ? "SELECT count(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'" 
      : "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
    
    const tableExists = await dbGet(checkSql);
    const hasUsersTable = mysqlPool ? (tableExists.count > 0) : !!tableExists;

    if (!hasUsersTable) {
      console.log('Initialisation de la base de données...');
      const scriptName = mysqlPool ? 'mariadb_setup.sql' : 'sqlite_setup.sql';
      const sqlScript = fs.readFileSync(path.resolve(process.cwd(), `database_setup/${scriptName}`), 'utf-8');
      
      const statements = sqlScript.split(';').filter(s => s.trim().length > 0);
      for (const statement of statements) {
        try {
          if (mysqlPool) {
            await mysqlPool.query(statement);
          } else {
            sqliteDb.prepare(statement).run();
          }
        } catch (err: any) {
          if (!err.message.includes('DROP TABLE')) console.error("Error running statement: ", err.message, statement);
        }
      }
      console.log('Base de données initialisée avec', scriptName);
    }
  } catch (error) {
    console.error("Erreur lors de la vérification/initialisation de la BDD:", error);
  }

  // ==========================================
  // ENDPOINTS API
  // ==========================================

  // 1. UTILISATEURS (Militaires)
  app.get('/api/users', async (req, res) => {
    try {
      const users = await dbAll('SELECT * FROM users');
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    } catch (error: any) {
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
      const result = await dbRun(sql, params);
      res.status(201).json({ id: result.id, message: 'Utilisateur créé avec succès.' });
    } catch (error: any) {
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
      await dbRun(sql, params);
      res.json({ message: 'Utilisateur mis à jour avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      await dbRun('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. DEMANDES / DOSSIERS (Requests)
  app.get('/api/requests', async (req, res) => {
    try {
      const requests = await dbAll('SELECT * FROM requests');
      // Map to frontend format
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
    } catch (error: any) {
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
        r.id || Date.now().toString(), r.assure, r.matricule, r.membre, r.prenoms, r.sexe, r.dateNaissance, r.lieuNaissance, r.gs,
        r.refIdentityDoc, r.refMarriageCertificate, r.refScolariteDoc, r.motherName, r.profession, r.residence,
        r.telephone, r.lien, r.date || new Date().toISOString(), r.statut || 'En attente', r.numInformatique, r.numCama, r.justificatif, r.rejectionReason,
        r.documentImage, r.userId, r.emailNotificationSent ? 1 : 0
      ];
      await dbRun(sql, params);
      res.status(201).json({ message: 'Dossier créé avec succès.' });
    } catch (error: any) {
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
      await dbRun(sql, params);
      res.json({ message: 'Dossier mis à jour avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/requests/:id', async (req, res) => {
    try {
      await dbRun('DELETE FROM requests WHERE id = ?', [req.params.id]);
      res.json({ message: 'Dossier supprimé avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. CENTRES CONVENTIONNÉS
  app.get('/api/centres', async (req, res) => {
    try {
      const centres = await dbAll('SELECT * FROM centres');
      res.json(centres);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/centres', async (req, res) => {
    const c = req.body;
    try {
      const result = await dbRun('INSERT INTO centres (nom, ville, type) VALUES (?, ?, ?)', [c.nom, c.ville, c.type]);
      res.status(201).json({ id: result.id, message: 'Centre ajouté avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/centres/:id', async (req, res) => {
    const c = req.body;
    try {
      await dbRun('UPDATE centres SET nom = ?, ville = ?, type = ? WHERE id = ?', [c.nom, c.ville, c.type, req.params.id]);
      res.json({ message: 'Centre mis à jour avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/centres/:id', async (req, res) => {
    try {
      await dbRun('DELETE FROM centres WHERE id = ?', [req.params.id]);
      res.json({ message: 'Centre supprimé avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. ACTUALITÉS (Articles)
  app.get('/api/articles', async (req, res) => {
    try {
      const articles = await dbAll('SELECT * FROM articles ORDER BY id DESC');
      res.json(articles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/articles', async (req, res) => {
    const a = req.body;
    try {
      const result = await dbRun(
        'INSERT INTO articles (title, date, status, author, category, content, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [a.title, a.date || new Date().toISOString(), a.status || 'Publié', a.author, a.category, a.content, a.image]
      );
      res.status(201).json({ id: result.id, message: 'Actualité publiée avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/articles/:id', async (req, res) => {
    const a = req.body;
    try {
      await dbRun(
        'UPDATE articles SET title = ?, date = ?, status = ?, author = ?, category = ?, content = ?, image = ? WHERE id = ?',
        [a.title, a.date, a.status, a.author, a.category, a.content, a.image, req.params.id]
      );
      res.json({ message: 'Actualité mise à jour avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/articles/:id', async (req, res) => {
    try {
      await dbRun('DELETE FROM articles WHERE id = ?', [req.params.id]);
      res.json({ message: 'Actualité supprimée avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. SITE SETTINGS (Configuration)
  app.get('/api/site-settings', async (req, res) => {
    try {
      let row = await dbGet('SELECT * FROM site_settings LIMIT 1');
      if (!row) {
        // If the table is empty, let's insert a default row so it's initialized!
        const defaultSettings = {
          popup_title: "La CAMA officiellement lancée !",
          popup_subtitle: "La santé de nos héros, notre priorité.",
          popup_content: "La CAMA, soucieuse du bien-être des soldats engagés dans la lutte, vient à point nommé étendre ses services à la famille de nos forces armées nationales. Découvrez le nouveau portail de gestion de vos prestations.",
          popup_active: 1,
          popup_image: "https://images.unsplash.com/photo-1579548122080-c11707ea8211?q=80&w=2070&auto=format&fit=crop",
          popup_max_views: 2,
          hero_bg_watermark_opacity: 25,
          prestations: '[]',
          dg_name: "Colonel-Major Saïdou YONABA",
          dg_message: "Message",
          dg_citation: "Citation",
          dg_image: "",
          about_content: '{}',
          statistics: '[]',
          facebook_page_url: "https://facebook.com/CAMA_BF",
          quality_citation: "",
          quality_author: "",
          testimonials: '[]',
          partners: '[]',
          hero_image: "",
          hero_title: "",
          hero_subtitle: "",
          menu_visibility: '{"about":true,"services":true,"news":true,"contact":true,"vision":true,"rgpd":true}',
          section_titles: '{"prestations":"Nos prestations","services":"Services en ligne"}',
          footer: JSON.stringify({
            copyright: "© 2026 CAMA Burkina Faso. Tous droits réservés.",
            liensRapides: [
              { label: "Accueil", url: "/" },
              { label: "Notre Mission", url: "/about" },
              { label: "Catalogue des Services", url: "/services" },
              { label: "Actualités", url: "/news" }
            ],
            espaceNumerique: [
              { label: "Espace Assuré", url: "/login" },
              { label: "Plateforme d'enrôlement", url: "/login" },
              { label: "Portail Administrateur", url: "/login" },
              { label: "Simulateur de prestations", url: "/services" }
            ],
            contactTitle: "Contactez-nous",
            address: "Camp Guillaume Ouédraogo, Ouagadougou, Burkina Faso",
            phone: "+226 25 00 00 00",
            email: "contact@cama.bf",
            description: "Caisse d'Assurance Maladie des Armées. Garantir une couverture santé universelle et solidaire pour nos forces armées et leurs familles.",
            badgeText: "La Patrie ou la Mort, nous vaincrons !"
          }),
          faqs: JSON.stringify([
            {
              id: 1,
              q: "Comment s'enrôler ?",
              a: "Pour s'enrôler, connectez-vous à votre Espace Assuré, cliquez sur 'Nouveau membre' dans votre tableau de bord, et téléversez des justificatifs (acte de naissance, de mariage). Nos agents valideront votre dossier sous 48 heures.",
              active: true
            },
            {
              id: 2,
              q: "Suivre mes remboursements ?",
              a: "Vos demandes de remboursement et dossiers de soins sont suivis en ligne en temps réel. Rendez-vous dans votre Espace Assuré au menu de 'Suivi des dossiers' pour voir leur statut de validation.",
              active: true
            },
            {
              id: 3,
              q: "Où sont les cliniques agréées ?",
              a: "La CAMA dispose d'un réseau conventionné de 128 cliniques et officines. Vous trouverez l'annuaire complet et cartographié dans notre catalogue des services section 'Réseau de soins'.",
              active: true
            },
            {
              id: 4,
              q: "Quels sont les taux de couverture ?",
              a: "La CAMA prend en charge de 70% à 100% des frais de santé selon la nature des soins et le type d'intervention médicale, dans le strict respect de la réglementation militaire de prévoyance.",
              active: true
            }
          ])
        };
        
        const sql = `
          INSERT INTO site_settings (
            id, popup_title, popup_subtitle, popup_content, popup_active, popup_image, popup_max_views, 
            hero_bg_watermark_opacity, prestations, dg_name, dg_message, dg_citation, dg_image, 
            about_content, statistics, facebook_page_url, quality_citation, quality_author, 
            testimonials, partners, hero_image, hero_title, hero_subtitle, menu_visibility, 
            section_titles, footer, faqs
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          1, defaultSettings.popup_title, defaultSettings.popup_subtitle, defaultSettings.popup_content, defaultSettings.popup_active,
          defaultSettings.popup_image, defaultSettings.popup_max_views, defaultSettings.hero_bg_watermark_opacity, defaultSettings.prestations,
          defaultSettings.dg_name, defaultSettings.dg_message, defaultSettings.dg_citation, defaultSettings.dg_image,
          defaultSettings.about_content, defaultSettings.statistics, defaultSettings.facebook_page_url, defaultSettings.quality_citation,
          defaultSettings.quality_author, defaultSettings.testimonials, defaultSettings.partners, defaultSettings.hero_image,
          defaultSettings.hero_title, defaultSettings.hero_subtitle, defaultSettings.menu_visibility, defaultSettings.section_titles,
          defaultSettings.footer, defaultSettings.faqs
        ];
        await dbRun(sql, params);
        row = await dbGet('SELECT * FROM site_settings LIMIT 1');
      }
      
      const settings = {
        popupTitle: row.popup_title,
        popupSubtitle: row.popup_subtitle,
        popupContent: row.popup_content,
        popupActive: Boolean(row.popup_active),
        popupImage: row.popup_image,
        popupMaxViews: row.popup_max_views,
        heroBgWatermarkOpacity: row.hero_bg_watermark_opacity,
        prestations: safeParse(row.prestations, []),
        dgName: row.dg_name,
        dgMessage: row.dg_message,
        dgCitation: row.dg_citation,
        dgImage: row.dg_image,
        aboutContent: safeParse(row.about_content, {}),
        statistics: safeParse(row.statistics, []),
        facebookPageUrl: row.facebook_page_url,
        qualityCitation: row.quality_citation,
        qualityAuthor: row.quality_author,
        testimonials: safeParse(row.testimonials, []),
        partners: safeParse(row.partners, []),
        heroImage: row.hero_image,
        heroTitle: row.hero_title,
        heroSubtitle: row.hero_subtitle,
        menuVisibility: safeParse(row.menu_visibility, {}),
        sectionTitles: safeParse(row.section_titles, {}),
        footer: safeParse(row.footer, {}),
        faqs: safeParse(row.faqs, [])
      };
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/site-settings', async (req, res) => {
    const s = req.body;
    try {
      const row = await dbGet('SELECT id FROM site_settings LIMIT 1');
      
      if (row) {
        const sql = `
          UPDATE site_settings SET 
            popup_title = ?, popup_subtitle = ?, popup_content = ?, popup_active = ?, popup_image = ?, popup_max_views = ?, 
            hero_bg_watermark_opacity = ?, prestations = ?, dg_name = ?, dg_message = ?, dg_citation = ?, dg_image = ?, 
            about_content = ?, statistics = ?, facebook_page_url = ?, quality_citation = ?, quality_author = ?, 
            testimonials = ?, partners = ?, hero_image = ?, hero_title = ?, hero_subtitle = ?, menu_visibility = ?, 
            section_titles = ?, footer = ?, faqs = ?
          WHERE id = ?
        `;
        const params = [
          s.popupTitle, s.popupSubtitle, s.popupContent, s.popupActive ? 1 : 0, s.popupImage, s.popupMaxViews,
          s.heroBgWatermarkOpacity, JSON.stringify(s.prestations || []), s.dgName, s.dgMessage, s.dgCitation, s.dgImage,
          JSON.stringify(s.aboutContent || {}), JSON.stringify(s.statistics || []), s.facebookPageUrl, s.qualityCitation, s.qualityAuthor,
          JSON.stringify(s.testimonials || []), JSON.stringify(s.partners || []), s.heroImage, s.heroTitle, s.heroSubtitle,
          JSON.stringify(s.menuVisibility || {}), JSON.stringify(s.sectionTitles || {}), JSON.stringify(s.footer || {}),
          JSON.stringify(s.faqs || []),
          row.id
        ];
        await dbRun(sql, params);
      } else {
        const sql = `
          INSERT INTO site_settings (
            id, popup_title, popup_subtitle, popup_content, popup_active, popup_image, popup_max_views, 
            hero_bg_watermark_opacity, prestations, dg_name, dg_message, dg_citation, dg_image, 
            about_content, statistics, facebook_page_url, quality_citation, quality_author, 
            testimonials, partners, hero_image, hero_title, hero_subtitle, menu_visibility, 
            section_titles, footer, faqs
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          1, s.popupTitle, s.popupSubtitle, s.popupContent, s.popupActive ? 1 : 0, s.popupImage, s.popupMaxViews,
          s.heroBgWatermarkOpacity, JSON.stringify(s.prestations || []), s.dgName, s.dgMessage, s.dgCitation, s.dgImage,
          JSON.stringify(s.aboutContent || {}), JSON.stringify(s.statistics || []), s.facebookPageUrl, s.qualityCitation, s.qualityAuthor,
          JSON.stringify(s.testimonials || []), JSON.stringify(s.partners || []), s.heroImage, s.heroTitle, s.heroSubtitle,
          JSON.stringify(s.menuVisibility || {}), JSON.stringify(s.sectionTitles || {}), JSON.stringify(s.footer || {}),
          JSON.stringify(s.faqs || [])
        ];
        await dbRun(sql, params);
      }
      res.json({ message: 'Configuration du site mise à jour.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. ACTION LOGS
  app.get('/api/logs', async (req, res) => {
    try {
      const logs = await dbAll('SELECT * FROM action_logs ORDER BY date DESC');
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/logs', async (req, res) => {
    const l = req.body;
    try {
      const id = Math.random().toString(36).substr(2, 9);
      const dateStr = new Date().toLocaleString('fr-FR');
      await dbRun(
        'INSERT INTO action_logs (id, user_id, action, date) VALUES (?, ?, ?, ?)',
        [id, l.userId, l.action, dateStr]
      );
      res.status(201).json({ message: 'Action enregistrée.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin users (Admins) API endpoint
  app.get('/api/admins', async (req, res) => {
    try {
      const admins = await dbAll('SELECT * FROM admin_users');
      // map permissions back from JSON
      const mapped = admins.map(a => ({
        ...a,
        permissions: JSON.parse(a.permissions || '[]')
      }));
      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admins', async (req, res) => {
    const a = req.body;
    try {
      const result = await dbRun(
        'INSERT INTO admin_users (name, email, status, role, permissions, created_date) VALUES (?, ?, ?, ?, ?, ?)',
        [a.name, a.email, a.status || 'Actif', a.role, JSON.stringify(a.permissions || []), new Date().toISOString()]
      );
      res.status(201).json({ id: result.id, message: 'Administrateur créé.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admins/:id', async (req, res) => {
    const a = req.body;
    try {
      await dbRun(
        'UPDATE admin_users SET name = ?, email = ?, status = ?, role = ?, permissions = ? WHERE id = ?',
        [a.name, a.email, a.status, a.role, JSON.stringify(a.permissions || []), req.params.id]
      );
      res.json({ message: 'Administrateur mis à jour.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admins/:id', async (req, res) => {
    try {
      await dbRun('DELETE FROM admin_users WHERE id = ?', [req.params.id]);
      res.json({ message: 'Administrateur supprimé.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
