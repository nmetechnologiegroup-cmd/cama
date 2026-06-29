import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

  if (ai) {
    console.log("Gemini API initialized successfully in backend.");
  } else {
    console.log("No GEMINI_API_KEY found, chatbot will use static intelligent fallbacks.");
  }

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
  const sanitizeParams = (params: any[]): any[] => {
    return params.map(val => val === undefined ? null : val);
  };

  const dbAll = async (sql: string, params: any[] = []): Promise<any[]> => {
    const cleanParams = sanitizeParams(params);
    if (mysqlPool) {
      const [rows] = await mysqlPool.execute(sql.replace(/\?/g, '?'), cleanParams);
      return rows as any[];
    }
    return sqliteDb.prepare(sql).all(cleanParams);
  };

  const dbGet = async (sql: string, params: any[] = []): Promise<any> => {
    const cleanParams = sanitizeParams(params);
    if (mysqlPool) {
      const [rows] = await mysqlPool.execute(sql.replace(/\?/g, '?'), cleanParams);
      const rowsArray = rows as any[];
      return rowsArray.length > 0 ? rowsArray[0] : undefined;
    }
    return sqliteDb.prepare(sql).get(cleanParams);
  };

  const dbRun = async (sql: string, params: any[] = []): Promise<{ id: number; changes: number }> => {
    const cleanParams = sanitizeParams(params);
    if (mysqlPool) {
      const [result] = await mysqlPool.execute(sql.replace(/\?/g, '?'), cleanParams);
      const res = result as mysql.ResultSetHeader;
      return { id: res.insertId, changes: res.affectedRows };
    }
    const info = sqliteDb.prepare(sql).run(cleanParams);
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
    
    // Migration de sécurité pour assurer la présence des colonnes indispensables dans 'users'
    try {
      if (mysqlPool) {
        const colsQuery = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'";
        const rows = await dbAll(colsQuery);
        const colNames = rows.map((r: any) => (r.COLUMN_NAME || r.column_name || '').toLowerCase());
        
        if (!colNames.includes('statut')) {
          await mysqlPool.query("ALTER TABLE users ADD COLUMN statut VARCHAR(50) DEFAULT 'Incomplet'");
        }
        if (!colNames.includes('pending_modifications')) {
          await mysqlPool.query("ALTER TABLE users ADD COLUMN pending_modifications LONGTEXT");
        }
        if (!colNames.includes('modification_traces')) {
          await mysqlPool.query("ALTER TABLE users ADD COLUMN modification_traces LONGTEXT");
        }
        if (!colNames.includes('num_dossier')) {
          await mysqlPool.query("ALTER TABLE users ADD COLUMN num_dossier VARCHAR(100)");
        }
        if (!colNames.includes('modification_rejected')) {
          await mysqlPool.query("ALTER TABLE users ADD COLUMN modification_rejected INT DEFAULT 0");
        }
        if (!colNames.includes('modification_rejection_reason')) {
          await mysqlPool.query("ALTER TABLE users ADD COLUMN modification_rejection_reason LONGTEXT");
        }
      } else {
        const columns = sqliteDb.prepare("PRAGMA table_info(users)").all();
        const colNames = columns.map((c: any) => c.name.toLowerCase());
        
        if (!colNames.includes('statut')) {
          sqliteDb.prepare("ALTER TABLE users ADD COLUMN statut TEXT DEFAULT 'Incomplet'").run();
        }
        if (!colNames.includes('pending_modifications')) {
          sqliteDb.prepare("ALTER TABLE users ADD COLUMN pending_modifications TEXT").run();
        }
        if (!colNames.includes('modification_traces')) {
          sqliteDb.prepare("ALTER TABLE users ADD COLUMN modification_traces TEXT").run();
        }
        if (!colNames.includes('num_dossier')) {
          sqliteDb.prepare("ALTER TABLE users ADD COLUMN num_dossier TEXT").run();
        }
        if (!colNames.includes('modification_rejected')) {
          sqliteDb.prepare("ALTER TABLE users ADD COLUMN modification_rejected INTEGER DEFAULT 0").run();
        }
        if (!colNames.includes('modification_rejection_reason')) {
          sqliteDb.prepare("ALTER TABLE users ADD COLUMN modification_rejection_reason TEXT").run();
        }
      }
      console.log('Vérification et migration des colonnes de la table users complétées.');
    } catch (migErr: any) {
      console.error("Erreur non bloquante de migration des colonnes users :", migErr.message);
    }
    
    // Create chat tables if they don't exist
    try {
      if (mysqlPool) {
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS chat_discussions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(100) NOT NULL,
            user_email VARCHAR(255),
            user_name VARCHAR(255),
            started_at VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active'
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        await mysqlPool.query(`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            discussion_id INT NOT NULL,
            sender VARCHAR(50) NOT NULL,
            text LONGTEXT NOT NULL,
            created_at VARCHAR(100) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      } else {
        sqliteDb.prepare(`
          CREATE TABLE IF NOT EXISTS chat_discussions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_email TEXT,
            user_name TEXT,
            started_at TEXT,
            status TEXT DEFAULT 'active'
          )
        `).run();
        sqliteDb.prepare(`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discussion_id INTEGER NOT NULL,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        `).run();
      }
      console.log('Tables de discussion chat vérifiées / créées.');
    } catch (chatDbErr: any) {
      console.error('Erreur lors de la création des tables de chat:', chatDbErr.message);
    }
    
    // Ensure logo and site title columns exist in site_settings table
    const alterColumns = async () => {
      const cols = [
        { name: 'logo_url', type: mysqlPool ? 'LONGTEXT' : 'TEXT' },
        { name: 'logo_width', type: 'INT' },
        { name: 'site_title', type: 'VARCHAR(255)' },
        { name: 'site_slogan', type: 'VARCHAR(255)' },
        { name: 'vision_content', type: mysqlPool ? 'LONGTEXT' : 'TEXT' },
        { name: 'rgpd_content', type: mysqlPool ? 'LONGTEXT' : 'TEXT' },
        { name: 'flash_infos', type: mysqlPool ? 'LONGTEXT' : 'TEXT' },
        { name: 'show_flash_infos', type: 'INT' },
        { name: 'chat_advisor_active', type: 'INT' },
        { name: 'chat_start_hour', type: 'VARCHAR(10)' },
        { name: 'chat_end_hour', type: 'VARCHAR(10)' }
      ];
      
      for (const col of cols) {
        try {
          if (mysqlPool) {
            const [check] = await mysqlPool.execute(
              `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = ?`,
              [col.name]
            );
            if ((check as any[]).length === 0) {
              await mysqlPool.execute(`ALTER TABLE site_settings ADD COLUMN ${col.name} ${col.type}`);
              console.log(`Added column ${col.name} to site_settings table in MariaDB`);
            }
          } else {
            try {
              sqliteDb.prepare(`ALTER TABLE site_settings ADD COLUMN ${col.name} ${col.type}`).run();
              console.log(`Added column ${col.name} to site_settings table in SQLite`);
            } catch (err: any) {
              if (!err.message.includes('duplicate column name')) {
                throw err;
              }
            }
          }
        } catch (e: any) {
          console.error(`Error altering table for column ${col.name}:`, e.message);
        }
      }

      // Convert existing columns to LONGTEXT for MariaDB to handle large base64 strings
      if (mysqlPool) {
        const columnsToLongText = [
          'popup_content', 'prestations', 'dg_message', 'about_content', 'statistics',
          'quality_citation', 'testimonials', 'partners', 'hero_subtitle',
          'menu_visibility', 'section_titles', 'footer', 'faqs'
        ];
        for (const colName of columnsToLongText) {
          try {
            await mysqlPool.execute(`ALTER TABLE site_settings MODIFY COLUMN ${colName} LONGTEXT`);
            console.log(`Successfully converted site_settings column ${colName} to LONGTEXT in MariaDB`);
          } catch (err: any) {
            console.error(`Error converting column ${colName} to LONGTEXT:`, err.message);
          }
        }
      }
    };
    await alterColumns();

    // Ensure columns exist in users table
    const alterUserColumns = async () => {
      const userCols = [
        { name: 'statut', type: "VARCHAR(50) DEFAULT 'En attente'" },
        { name: 'pending_modifications', type: mysqlPool ? 'LONGTEXT' : 'TEXT' },
        { name: 'modification_traces', type: mysqlPool ? 'LONGTEXT' : 'TEXT' }
      ];
      
      for (const col of userCols) {
        try {
          if (mysqlPool) {
            const [check] = await mysqlPool.execute(
              `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
              [col.name]
            );
            if ((check as any[]).length === 0) {
              await mysqlPool.execute(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
              console.log(`Added column ${col.name} to users table in MariaDB`);
            }
          } else {
            try {
              sqliteDb.prepare(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`).run();
              console.log(`Added column ${col.name} to users table in SQLite`);
            } catch (err: any) {
              if (!err.message.includes('duplicate column name')) {
                throw err;
              }
            }
          }
        } catch (e: any) {
          console.error(`Error altering users table for column ${col.name}:`, e.message);
        }
      }
    };
    await alterUserColumns();
  } catch (error) {
    console.error("Erreur lors de la vérification/initialisation de la BDD:", error);
  }

  // ==========================================
  // ENDPOINTS API
  // ==========================================

  // 1. UTILISATEURS (Militaires)
  const mapUserRow = (r: any) => {
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      matricule: r.matricule,
      corp: r.corp,
      email: r.email,
      password: r.password,
      status: r.status,
      phone: r.phone,
      address: r.address,
      prenoms: r.prenoms,
      sexe: r.sexe,
      numInformatique: r.num_informatique,
      grade: r.grade,
      categorie: r.categorie,
      numCim: r.num_cim,
      numCarteCama: r.num_carte_cama,
      numIup: r.num_iup,
      structArmee: r.struct_armee,
      structRegion: r.struct_region,
      structCorps: r.struct_corps,
      structService: r.struct_service,
      structSection: r.struct_section,
      structSousSection: r.struct_sous_section,
      telephones: r.telephones,
      personneAPrevenir: r.personne_a_prevenir,
      personneAPrevenirTel: r.personne_a_prevenir_tel,
      statut: r.statut || 'Incomplet',
      numDossier: r.num_dossier,
      pendingModifications: safeParse(r.pending_modifications, {}),
      modificationTraces: safeParse(r.modification_traces, []),
      modificationRejected: r.modification_rejected === 1 || r.modification_rejected === true,
      modificationRejectionReason: r.modification_rejection_reason || undefined
    };
  };

  app.get('/api/users', async (req, res) => {
    try {
      const users = await dbAll('SELECT * FROM users');
      res.json(users.map(mapUserRow));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(mapUserRow(user));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/users', async (req, res) => {
    const u = req.body;
    try {
      // Automatic numDossier generation if missing
      let numDossier = u.numDossier;
      if (!numDossier) {
        const year = new Date().getFullYear();
        const lastUser = await dbGet('SELECT num_dossier FROM users WHERE num_dossier LIKE ? ORDER BY id DESC LIMIT 1', [`CAMA-${year}-%`]);
        let nextSeq = 1;
        if (lastUser && lastUser.num_dossier) {
          const parts = lastUser.num_dossier.split('-');
          const lastSeq = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }
        numDossier = `CAMA-${year}-BF-${nextSeq.toString().padStart(4, '0')}`;
      }

      const sql = `
        INSERT INTO users (
          name, matricule, corp, email, password, status, phone, address, prenoms, sexe, 
          num_informatique, grade, categorie, num_cim, num_carte_cama, num_iup, 
          struct_armee, struct_region, struct_corps, struct_service, struct_section, struct_sous_section, 
          telephones, personne_a_prevenir, personne_a_prevenir_tel, 
          statut, pending_modifications, modification_traces, num_dossier
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        u.name, u.matricule, u.corp, u.email, u.password || 'password123', u.status || 'Actif',
        u.phone, u.address, u.prenoms, u.sexe || 'M',
        u.numInformatique !== undefined ? u.numInformatique : u.num_informatique,
        u.grade, u.categorie,
        u.numCim !== undefined ? u.numCim : u.num_cim,
        u.numCarteCama !== undefined ? u.numCarteCama : u.num_carte_cama,
        u.numIup !== undefined ? u.numIup : u.num_iup,
        u.structArmee !== undefined ? u.structArmee : u.struct_armee,
        u.structRegion !== undefined ? u.structRegion : u.struct_region,
        u.structCorps !== undefined ? u.structCorps : u.struct_corps,
        u.structService !== undefined ? u.structService : u.struct_service,
        u.structSection !== undefined ? u.structSection : u.struct_section,
        u.structSousSection !== undefined ? u.structSousSection : u.struct_sous_section,
        u.telephones,
        u.personneAPrevenir !== undefined ? u.personneAPrevenir : u.personne_a_prevenir,
        u.personneAPrevenirTel !== undefined ? u.personneAPrevenirTel : u.personne_a_prevenir_tel,
        u.statut || 'Incomplet',
        JSON.stringify(u.pendingModifications || {}),
        JSON.stringify(u.modificationTraces || []),
        numDossier
      ];
      const result = await dbRun(sql, params);
      
      // --- LOGIC FOR SYNCING WITH REQUESTS ---
      // If the user's status is 'Actif' or 'Validé', ensure they exist in 'requests'
      if (u.status === 'Actif' || u.statut === 'Validé') {
        const reqId = 'req-' + Date.now();
        const reqDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        const insertReqSql = `
          INSERT INTO requests (
            id, assure, matricule, membre, prenoms, sexe, lien, date, statut, num_informatique, num_cama, user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await dbRun(insertReqSql, [
          reqId,
          u.name + (u.prenoms ? ' ' + u.prenoms : ''), // assure
          u.matricule || u.numInformatique || u.num_informatique || '', // matricule
          u.name, // membre
          u.prenoms || '', // prenoms
          u.sexe || 'M', // sexe
          'Titulaire', // lien
          reqDate, // date
          'Validé', // statut
          u.numInformatique !== undefined ? u.numInformatique : (u.num_informatique || ''),
          u.numCarteCama !== undefined ? u.numCarteCama : (u.num_carte_cama || ''),
          result.id // user_id
        ]);
      }

      res.status(201).json({ id: result.id, message: 'Utilisateur créé avec succès.' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    const u = req.body;
    try {
      // Automatic numDossier generation if missing and status is Validé or Actif
      let numDossier = u.numDossier;
      if (!numDossier && (u.statut === 'Validé' || u.status === 'Actif')) {
        const year = new Date().getFullYear();
        const lastUser = await dbGet('SELECT num_dossier FROM users WHERE num_dossier LIKE ? ORDER BY id DESC LIMIT 1', [`CAMA-${year}-%`]);
        let nextSeq = 1;
        if (lastUser && lastUser.num_dossier) {
          const parts = lastUser.num_dossier.split('-');
          const lastSeq = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
        }
        numDossier = `CAMA-${year}-BF-${nextSeq.toString().padStart(4, '0')}`;
      }

      const sql = `
        UPDATE users SET 
          name = ?, corp = ?, email = ?, status = ?, phone = ?, address = ?, prenoms = ?, sexe = ?,
          num_informatique = ?, grade = ?, categorie = ?, num_cim = ?, num_carte_cama = ?, num_iup = ?,
          struct_armee = ?, struct_region = ?, struct_corps = ?, struct_service = ?, struct_section = ?, struct_sous_section = ?,
          telephones = ?, personne_a_prevenir = ?, personne_a_prevenir_tel = ?,
          statut = ?, pending_modifications = ?, modification_traces = ?, num_dossier = ?, matricule = ?,
          modification_rejected = ?, modification_rejection_reason = ?
        WHERE id = ?
      `;
      const params = [
        u.name, u.corp, u.email, u.status, u.phone, u.address, u.prenoms, u.sexe,
        u.numInformatique !== undefined ? u.numInformatique : u.num_informatique,
        u.grade, u.categorie,
        u.numCim !== undefined ? u.numCim : u.num_cim,
        u.numCarteCama !== undefined ? u.numCarteCama : u.num_carte_cama,
        u.numIup !== undefined ? u.numIup : u.num_iup,
        u.structArmee !== undefined ? u.structArmee : u.struct_armee,
        u.structRegion !== undefined ? u.structRegion : u.struct_region,
        u.structCorps !== undefined ? u.structCorps : u.struct_corps,
        u.structService !== undefined ? u.structService : u.struct_service,
        u.structSection !== undefined ? u.structSection : u.struct_section,
        u.structSousSection !== undefined ? u.structSousSection : u.struct_sous_section,
        u.telephones,
        u.personneAPrevenir !== undefined ? u.personneAPrevenir : u.personne_a_prevenir,
        u.personneAPrevenirTel !== undefined ? u.personneAPrevenirTel : u.personne_a_prevenir_tel,
        u.statut,
        u.pendingModifications !== undefined ? (typeof u.pendingModifications === 'string' ? u.pendingModifications : JSON.stringify(u.pendingModifications)) : null,
        u.modificationTraces !== undefined ? (typeof u.modificationTraces === 'string' ? u.modificationTraces : JSON.stringify(u.modificationTraces)) : null,
        numDossier !== undefined ? numDossier : (u.num_dossier || null),
        u.matricule,
        u.modificationRejected ? 1 : 0,
        u.modificationRejectionReason || null,
        req.params.id
      ];
      await dbRun(sql, params);

      // --- LOGIC FOR SYNCING WITH REQUESTS ---
      const reqStatut = u.statut || 'Incomplet';
      const existingReqs = await dbAll('SELECT id FROM requests WHERE user_id = ? AND lien = ?', [req.params.id, 'Titulaire']);
      if (existingReqs.length === 0) {
        const reqId = 'req-' + Date.now();
        const reqDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        const insertReqSql = `
          INSERT INTO requests (
            id, assure, matricule, membre, prenoms, sexe, lien, date, statut, num_informatique, num_cama, user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await dbRun(insertReqSql, [
          reqId,
          u.name + (u.prenoms ? ' ' + u.prenoms : ''),
          u.matricule || u.numInformatique || u.num_informatique || '',
          u.name,
          u.prenoms || '',
          u.sexe || 'M',
          'Titulaire',
          reqDate,
          reqStatut,
          u.numInformatique !== undefined ? u.numInformatique : (u.num_informatique || ''),
          u.numCarteCama !== undefined ? u.numCarteCama : (u.num_carte_cama || ''),
          req.params.id
        ]);
      } else {
        await dbRun(`UPDATE requests SET statut = ?, assure = ?, matricule = ?, membre = ?, prenoms = ?, sexe = ?, num_informatique = ?, num_cama = ? WHERE user_id = ? AND lien = 'Titulaire'`, [
          reqStatut,
          u.name + (u.prenoms ? ' ' + u.prenoms : ''),
          u.matricule || u.numInformatique || u.num_informatique || '',
          u.name,
          u.prenoms || '',
          u.sexe || 'M',
          u.numInformatique !== undefined ? u.numInformatique : (u.num_informatique || ''),
          u.numCarteCama !== undefined ? u.numCarteCama : (u.num_carte_cama || ''),
          req.params.id
        ]);
      }

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

      // Find all registered users to show their dossiers for admin verification and validation
      const users = await dbAll("SELECT * FROM users");
      const existingTitulaireUserIds = new Set(mapped.filter(r => r.lien === 'Titulaire').map(r => r.userId));
      
      const dynamicRequests = users
        .filter(u => !existingTitulaireUserIds.has(u.id))
        .map(u => {
          const pMods = safeParse(u.pending_modifications, {});
          
          // Merge pending modifications into the user details
          const mergedName = pMods.name || u.name || '';
          const mergedPrenoms = pMods.prenoms || u.prenoms || '';
          const mergedMatricule = pMods.matricule || u.matricule || u.num_informatique || '';
          const mergedSexe = pMods.sexe || u.sexe || 'M';
          const mergedAddress = pMods.address || u.address || '';
          const mergedPhone = pMods.telephones || u.phone || u.telephones || '';
          const mergedNumInformatique = pMods.numInformatique || u.num_informatique || '';
          const mergedNumCama = pMods.numCarteCama || u.num_carte_cama || '';

          return {
            id: 'auto-req-' + u.id,
            assure: mergedName + (mergedPrenoms ? ' ' + mergedPrenoms : ''),
            matricule: mergedMatricule,
            membre: mergedName,
            prenoms: mergedPrenoms,
            sexe: mergedSexe,
            dateNaissance: pMods.dateNaissance || '',
            lieuNaissance: pMods.lieuNaissance || '',
            gs: pMods.gs || '',
            refIdentityDoc: pMods.refIdentityDoc || '',
            refMarriageCertificate: pMods.refMarriageCertificate || '',
            refScolariteDoc: pMods.refScolariteDoc || '',
            motherName: pMods.motherName || '',
            profession: 'Militaire',
            residence: mergedAddress,
            telephone: mergedPhone,
            lien: 'Titulaire',
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
            statut: u.statut === 'Validé' ? 'Validé' : (u.statut || 'Incomplet'),
            numInformatique: mergedNumInformatique,
            numCama: mergedNumCama,
            justificatif: '',
            rejectionReason: '',
            documentImage: null,
            userId: u.id,
            emailNotificationSent: false
          };
        });

      res.json([...mapped, ...dynamicRequests]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/requests/:id', async (req, res) => {
    try {
      const r = await dbGet('SELECT * FROM requests WHERE id = ?', [req.params.id]);
      if (!r) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json({
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
      });
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
      const isAutoReq = req.params.id.startsWith('auto-req-');
      const isTitulaire = r.lien === 'Titulaire' || isAutoReq;

      if (isTitulaire) {
        // Find corresponding user
        const userId = isAutoReq ? req.params.id.replace('auto-req-', '') : r.userId;
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
        if (user) {
          const newStatut = r.statut || 'Incomplet';
          // When an admin validates the subscriber request, activate the user account too
          const newStatus = newStatut === 'Validé' ? 'Actif' : 'Inactif';

          // Dynamically generate a folder number (num_dossier) if they are being validated and don't have one
          let numDossier = user.num_dossier;
          if (!numDossier && (newStatut === 'Validé' || newStatus === 'Actif')) {
            const year = new Date().getFullYear();
            try {
              const lastUser = await dbGet('SELECT num_dossier FROM users WHERE num_dossier LIKE ? ORDER BY id DESC LIMIT 1', [`CAMA-${year}-BF-%`]);
              let nextSeq = 1;
              if (lastUser && lastUser.num_dossier) {
                const parts = lastUser.num_dossier.split('-');
                const lastSeq = parseInt(parts[parts.length - 1], 10);
                if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
              }
              numDossier = `CAMA-${year}-BF-${nextSeq.toString().padStart(4, '0')}`;
            } catch (err) {
              numDossier = `CAMA-${year}-BF-0001`;
            }
          }

          if (newStatut === 'Validé') {
            const pMods = safeParse(user.pending_modifications, {});
            
            // Map camelCase pending modifications to snake_case columns
            const merged = {
              name: r.assure || pMods.name || user.name || '',
              prenoms: r.prenoms || pMods.prenoms || user.prenoms || '',
              sexe: r.sexe || pMods.sexe || user.sexe || 'M',
              matricule: r.matricule || pMods.matricule || user.matricule || '',
              num_informatique: r.numInformatique !== undefined ? r.numInformatique : (pMods.numInformatique || user.num_informatique || ''),
              num_carte_cama: r.numCama !== undefined ? r.numCama : (pMods.numCarteCama || user.num_carte_cama || ''),
              grade: pMods.grade || user.grade || '',
              categorie: pMods.categorie || user.categorie || '',
              num_cim: pMods.numCim || user.num_cim || '',
              num_iup: pMods.numIup || user.num_iup || '',
              struct_armee: pMods.structArmee || user.struct_armee || '',
              struct_region: pMods.structRegion || user.struct_region || '',
              struct_corps: pMods.structCorps || user.struct_corps || user.corp || '',
              struct_service: pMods.structService || user.struct_service || '',
              struct_section: pMods.structSection || user.struct_section || '',
              struct_sous_section: pMods.structSousSection || user.struct_sous_section || '',
              telephones: pMods.telephones || user.telephones || r.telephone || user.phone || '',
              personne_a_prevenir: pMods.personneAPrevenir || user.personne_a_prevenir || '',
              personne_a_prevenir_tel: pMods.personneAPrevenirTel || user.personne_a_prevenir_tel || '',
              statut: 'Validé',
              status: 'Actif',
              num_dossier: numDossier,
              pending_modifications: null
            };

            const updateSql = `
              UPDATE users SET 
                name = ?, prenoms = ?, sexe = ?, matricule = ?, num_informatique = ?, num_carte_cama = ?, 
                grade = ?, categorie = ?, num_cim = ?, num_iup = ?, struct_armee = ?, struct_region = ?, 
                struct_corps = ?, struct_service = ?, struct_section = ?, struct_sous_section = ?, 
                telephones = ?, personne_a_prevenir = ?, personne_a_prevenir_tel = ?, 
                statut = ?, status = ?, num_dossier = ?, pending_modifications = ?
              WHERE id = ?
            `;
            await dbRun(updateSql, [
              merged.name, merged.prenoms, merged.sexe, merged.matricule, merged.num_informatique, merged.num_carte_cama,
              merged.grade, merged.categorie, merged.num_cim, merged.num_iup, merged.struct_armee, merged.struct_region,
              merged.struct_corps, merged.struct_service, merged.struct_section, merged.struct_sous_section,
              merged.telephones, merged.personne_a_prevenir, merged.personne_a_prevenir_tel,
              merged.statut, merged.status, merged.num_dossier, merged.pending_modifications,
              userId
            ]);
          } else {
            const updateSql = `
              UPDATE users SET 
                name = ?, matricule = ?, num_informatique = ?, num_carte_cama = ?, 
                statut = ?, status = ?, num_dossier = ?, phone = ?, address = ?
              WHERE id = ?
            `;
            await dbRun(updateSql, [
              r.assure, 
              r.matricule, 
              r.numInformatique !== undefined ? r.numInformatique : (user.num_informatique || ''), 
              r.numCama !== undefined ? r.numCama : (user.num_carte_cama || ''),
              newStatut, 
              newStatus, 
              numDossier, 
              r.telephone || user.phone || '', 
              r.residence || user.address || '',
              userId
            ]);
          }
        }
      }

      // Keep requests table synchronized
      const exists = await dbGet('SELECT id FROM requests WHERE id = ?', [req.params.id]);
      if (exists) {
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
      } else {
        const sql = `
          INSERT INTO requests (id, assure, matricule, membre, prenoms, sexe, date_naissance, lieu_naissance, gs, ref_identity_doc, ref_marriage_certificate, ref_scolarite_doc, mother_name, profession, residence, telephone, lien, date, statut, num_informatique, num_cama, justificatif, rejection_reason, document_image, user_id, email_notification_sent)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          req.params.id, r.assure, r.matricule, r.membre, r.prenoms, r.sexe, r.dateNaissance, r.lieuNaissance, r.gs,
          r.refIdentityDoc, r.refMarriageCertificate, r.refScolariteDoc, r.motherName, r.profession, r.residence,
          r.telephone, r.lien, r.date || new Date().toISOString(), r.statut || 'En attente', r.numInformatique, r.numCama, r.justificatif, r.rejectionReason,
          r.documentImage, r.userId, r.emailNotificationSent ? 1 : 0
        ];
        await dbRun(sql, params);
      }

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
        faqs: safeParse(row.faqs, []),
        logoUrl: row.logo_url || "https://lh3.googleusercontent.com/d/1Xy_JkXv_E6NfT8Z_wG7_G_Fv5R0q9Y0K",
        logoWidth: Number(row.logo_width) || 80,
        siteTitle: row.site_title || "CAMA",
        siteSlogan: row.site_slogan || "CAISSE D'ASSURANCE MALADIE DES ARMÉES",
        visionContent: row.vision_content || "Notre vision est de devenir un modèle d’excellence en matière de protection sociale et d’assurance maladie militaire en Afrique de l'Ouest. Nous nous engageons à offrir une couverture sanitaire universelle, solidaire et équitable à l'ensemble des forces armées nationales, de leurs familles et des retraités militaires.\n\nÀ travers la modernisation constante de nos infrastructures, la digitalisation de nos processus de traitement des dossiers et des partenariats solides avec un réseau étendu de centres de soins de qualité, nous veillons à ce que chaque héros de notre nation et ses ayants droit bénéficient d'une prise en charge médicale rapide, humaine et efficace, partout sur le territoire.",
        rgpdContent: row.rgpd_content || "Conformément aux réglementations nationales et internationales en vigueur concernant la protection des données personnelles, la Caisse d'Assurance Maladie des Armées (CAMA) s'engage à assurer la confidentialité, la sécurité et l'intégrité de toutes les données collectées sur ses plateformes.\n\nLes données d’enrôlement de vos membres de famille, vos informations médicales et vos pièces justificatives sont exclusivement traitées pour la gestion de vos droits d’assurance maladie et la validation de vos prises en charge. Vos données ne sont en aucun cas cédées, vendues ou partagées avec des tiers non autorisés. Vous disposez d’un droit d’accès, de rectification et de suppression de vos données personnelles sur simple demande adressée à notre Délégué à la Protection des Données (DPO).",
        flashInfos: safeParse(row.flash_infos, []),
        showFlashInfos: (row.show_flash_infos !== undefined && row.show_flash_infos !== null) ? Boolean(row.show_flash_infos) : true,
        chatAdvisorActive: (row.chat_advisor_active !== undefined && row.chat_advisor_active !== null) ? Boolean(row.chat_advisor_active) : false,
        chatStartHour: row.chat_start_hour || "08:00",
        chatEndHour: row.chat_end_hour || "17:00"
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
            section_titles = ?, footer = ?, faqs = ?, logo_url = ?, logo_width = ?, site_title = ?, site_slogan = ?,
            vision_content = ?, rgpd_content = ?, flash_infos = ?, show_flash_infos = ?,
            chat_advisor_active = ?, chat_start_hour = ?, chat_end_hour = ?
          WHERE id = ?
        `;
        const params = [
          s.popupTitle, s.popupSubtitle, s.popupContent, s.popupActive ? 1 : 0, s.popupImage, s.popupMaxViews,
          s.heroBgWatermarkOpacity, JSON.stringify(s.prestations || []), s.dgName, s.dgMessage, s.dgCitation, s.dgImage,
          JSON.stringify(s.aboutContent || {}), JSON.stringify(s.statistics || []), s.facebookPageUrl, s.qualityCitation, s.qualityAuthor,
          JSON.stringify(s.testimonials || []), JSON.stringify(s.partners || []), s.heroImage, s.heroTitle, s.heroSubtitle,
          JSON.stringify(s.menuVisibility || {}), JSON.stringify(s.sectionTitles || {}), JSON.stringify(s.footer || {}),
          JSON.stringify(s.faqs || []), s.logoUrl, s.logoWidth, s.siteTitle, s.siteSlogan,
          s.visionContent, s.rgpdContent,
          JSON.stringify(s.flashInfos || []), s.showFlashInfos ? 1 : 0,
          s.chatAdvisorActive ? 1 : 0, s.chatStartHour || "08:00", s.chatEndHour || "17:00",
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
            section_titles, footer, faqs, logo_url, logo_width, site_title, site_slogan,
            vision_content, rgpd_content, flash_infos, show_flash_infos,
            chat_advisor_active, chat_start_hour, chat_end_hour
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          1, s.popupTitle, s.popupSubtitle, s.popupContent, s.popupActive ? 1 : 0, s.popupImage, s.popupMaxViews,
          s.heroBgWatermarkOpacity, JSON.stringify(s.prestations || []), s.dgName, s.dgMessage, s.dgCitation, s.dgImage,
          JSON.stringify(s.aboutContent || {}), JSON.stringify(s.statistics || []), s.facebookPageUrl, s.qualityCitation, s.qualityAuthor,
          JSON.stringify(s.testimonials || []), JSON.stringify(s.partners || []), s.heroImage, s.heroTitle, s.heroSubtitle,
          JSON.stringify(s.menuVisibility || {}), JSON.stringify(s.sectionTitles || {}), JSON.stringify(s.footer || {}),
          JSON.stringify(s.faqs || []), s.logoUrl, s.logoWidth, s.siteTitle, s.siteSlogan,
          s.visionContent, s.rgpdContent,
          JSON.stringify(s.flashInfos || []), s.showFlashInfos ? 1 : 0,
          s.chatAdvisorActive ? 1 : 0, s.chatStartHour || "08:00", s.chatEndHour || "17:00"
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

  // ==========================================
  // DISCUSSIONS / CHAT API
  // ==========================================

  // Get or create discussion for user
  app.post('/api/chat/discussions', async (req, res) => {
    const { sessionId, userEmail, userName } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId est requis" });
    }
    try {
      // Check if active discussion exists
      let disc = await dbGet("SELECT * FROM chat_discussions WHERE session_id = ? AND status = 'active' LIMIT 1", [sessionId]);
      if (!disc) {
        const result = await dbRun(
          "INSERT INTO chat_discussions (session_id, user_email, user_name, started_at, status) VALUES (?, ?, ?, ?, 'active')",
          [sessionId, userEmail || null, userName || 'Visiteur Anonyme', new Date().toISOString()]
        );
        const newId = mysqlPool ? (result as any).insertId : result;
        disc = await dbGet("SELECT * FROM chat_discussions WHERE id = ?", [newId]);
      }
      
      // Also fetch messages
      const messages = await dbAll("SELECT * FROM chat_messages WHERE discussion_id = ? ORDER BY id ASC", [disc.id]);
      res.json({ discussion: disc, messages });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get messages for a discussion
  app.get('/api/chat/discussions/:id/messages', async (req, res) => {
    try {
      const messages = await dbAll("SELECT * FROM chat_messages WHERE discussion_id = ? ORDER BY id ASC", [req.params.id]);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Post a message to a discussion
  app.post('/api/chat/discussions/:id/messages', async (req, res) => {
    const { sender, text } = req.body;
    const discussionId = req.params.id;
    if (!sender || !text) {
      return res.status(400).json({ error: "sender et text sont requis" });
    }
    try {
      const result = await dbRun(
        "INSERT INTO chat_messages (discussion_id, sender, text, created_at) VALUES (?, ?, ?, ?)",
        [discussionId, sender, text, new Date().toISOString()]
      );
      const newId = mysqlPool ? (result as any).insertId : result;
      const msg = await dbGet("SELECT * FROM chat_messages WHERE id = ?", [newId]);

      // Server-side co-pilot reply: if the user sends a message, have the AI instantly reply as "conseiller" inside the database!
      if (sender === 'user') {
        setTimeout(async () => {
          try {
            // Fetch previous discussion messages for context
            const previousMsgs = await dbAll("SELECT * FROM chat_messages WHERE discussion_id = ? ORDER BY id ASC", [discussionId]);
            let replyText = "Je vous prie de m'excuser, notre équipe de conseillers est en cours d'intervention. Que puis-je faire pour vous aider en attendant ?";
            
            if (ai) {
              const chatPrompt = previousMsgs.slice(-10).map((m: any) => `${m.sender === 'user' ? 'Utilisateur' : 'Conseiller'}: ${m.text}`).join('\n');
              const systemInstruction = "Vous êtes le conseiller de la CAMA (Caisse d'Assurance Maladie des Armées du Burkina Faso). Répondez de manière claire, concise, structurée et chaleureuse. Rappelez les règles du workflow : s'inscrire, remplir son profil militaire, attendre la validation admin, puis une fois Validé, l'assuré peut ajouter des membres de sa famille (FIF). Ne dépassez pas 3-4 phrases par réponse.";
              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: chatPrompt + "\nConseiller:",
                config: { systemInstruction }
              });
              if (response.text) {
                replyText = response.text;
              }
            } else {
              // Static intelligent fallback
              const textLower = text.toLowerCase();
              if (textLower.includes('workflow') || textLower.includes('comment') || textLower.includes('etape') || textLower.includes('étape') || textLower.includes('processus') || textLower.includes('marche')) {
                replyText = "Le processus de la CAMA est simple : 1. Création de votre compte avec votre matricule solde. 2. Saisie et complétion de vos informations de profil. 3. Validation par l'administrateur. **Vous ne pourrez ajouter aucun membre tant que l'administration ne vous aura pas validé.** 4. Enrôlement de vos membres (conjoint/enfants) via le bouton vert 'Nouveau membre (FIF)'.";
              } else if (textLower.includes('membre') || textLower.includes('ajouter') || textLower.includes('famille') || textLower.includes('fif') || textLower.includes('conjoint') || textLower.includes('enfant')) {
                replyText = "Pour ajouter un membre (FIF), votre compte militaire doit être au statut **'Validé'** par l'administrateur. Ensuite, cliquez sur 'Nouveau membre (FIF)' sur votre tableau de bord, renseignez les informations civiles et déposez l'acte de naissance ou de mariage.";
              } else if (textLower.includes('valider') || textLower.includes('validation') || textLower.includes('en attente')) {
                replyText = "Si votre dossier est 'En attente' ou 'Modifications à Valider', l'administration CAMA doit d'abord vérifier et approuver vos informations avant de vous donner accès à l'enrôlement des membres de votre famille.";
              }
            }

            await dbRun(
              "INSERT INTO chat_messages (discussion_id, sender, text, created_at) VALUES (?, 'conseiller', ?, ?)",
              [discussionId, replyText, new Date().toISOString()]
            );
          } catch (aiErr: any) {
            console.error("Error generating instant database co-pilot reply:", aiErr.message);
          }
        }, 1500);
      }

      res.json(msg);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // List all discussions for Admin
  app.get('/api/chat/discussions', async (req, res) => {
    try {
      const discussions = await dbAll("SELECT * FROM chat_discussions ORDER BY started_at DESC");
      const enriched = [];
      for (const d of discussions) {
        const lastMsg = await dbGet("SELECT * FROM chat_messages WHERE discussion_id = ? ORDER BY id DESC LIMIT 1", [d.id]);
        enriched.push({
          ...d,
          lastMessage: lastMsg || null
        });
      }
      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update discussion status (e.g. close)
  app.put('/api/chat/discussions/:id', async (req, res) => {
    const { status } = req.body;
    try {
      await dbRun("UPDATE chat_discussions SET status = ? WHERE id = ?", [status || 'active', req.params.id]);
      res.json({ message: "Discussion mise à jour." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete a discussion
  app.delete('/api/chat/discussions/:id', async (req, res) => {
    try {
      await dbRun("DELETE FROM chat_discussions WHERE id = ?", [req.params.id]);
      await dbRun("DELETE FROM chat_messages WHERE discussion_id = ?", [req.params.id]);
      res.json({ message: "Discussion supprimée." });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. CHAT AI ASSISTANT ENDPOINT
  app.post('/api/chat/ai', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages est requis" });
    }

    const lastUserMessage = messages.filter((m: any) => m.sender === 'user').pop()?.text || "";

    if (ai) {
      try {
        // Prepare context
        const chatPrompt = messages.slice(-10).map((m: any) => `${m.sender === 'user' ? 'Utilisateur' : 'Conseiller'}: ${m.text}`).join('\n');
        const systemInstruction = "Vous êtes le conseiller virtuel intelligent de la CAMA (Caisse d'Assurance Maladie des Armées du Burkina Faso). Répondez de manière claire, concise, structurée et chaleureuse aux préoccupations de l'assuré ou du visiteur. Rappelez les règles du workflow : s'inscrire, remplir son profil militaire, attendre la validation admin, puis une fois Validé, l'assuré peut ajouter des membres de famille (FIF). Ne dépassez pas 3-4 phrases par réponse.";
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: chatPrompt + "\nConseiller:",
          config: {
            systemInstruction
          }
        });

        const reply = response.text || "Je suis à votre entière disposition pour vous guider.";
        return res.json({ reply });
      } catch (geminiErr: any) {
        console.error("Gemini API Error, falling back to static logic:", geminiErr.message);
      }
    }

    // Static intelligent fallback
    const text = lastUserMessage.toLowerCase();
    let reply = "Bonjour! Je suis le conseiller virtuel de la CAMA. Comment puis-je vous aider aujourd'hui ?";

    if (text.includes('workflow') || text.includes('comment') || text.includes('etape') || text.includes('étape') || text.includes('processus') || text.includes('marche') || text.includes('créer') || text.includes('creer')) {
      reply = "Voici le processus complet de la CAMA :\n\n1. **Création du Compte** : Le militaire s'inscrit en saisissant son matricule solde, son nom, ses prénoms, son email et son corps d'armée.\n2. **Saisie du Profil** : Il se connecte et complète ses données (N° IUP, CIM, grade, affectation, etc.).\n3. **Validation Administrative** : Un administrateur examine et valide son dossier militaire. **Tant que cette étape n'est pas validée, il ne peut pas enrôler de membre.**\n4. **Ajout de Membre** : Une fois validé, il clique sur 'Nouveau membre (FIF)' pour enrôler ses bénéficiaires (conjoint, enfants) et télécharge les pièces justificatives.";
    } else if (text.includes('membre') || text.includes('ajouter') || text.includes('famille') || text.includes('fif') || text.includes('enfant') || text.includes('conjoint')) {
      reply = "Pour ajouter un membre de votre famille (FIF) :\n\n- Assurez-vous d'abord que votre profil militaire a été entièrement complété et **Validé** par un administrateur.\n- Rendez-vous sur votre tableau de bord et cliquez sur le bouton vert **'Nouveau membre (FIF)'**.\n- Renseignez les informations civiles et téléchargez les pièces justificatives (acte de naissance, acte de mariage, photo d'identité).\n- Un gestionnaire CAMA validera ensuite la demande d'enrôlement pour émettre sa carte d'assurance.";
    } else if (text.includes('validation') || text.includes('validé') || text.includes('valide') || text.includes('en attente') || text.includes('statut')) {
      reply = "Votre statut d'enrôlement détermine vos actions :\n\n- **En attente (Nouveau compte)** : Vous venez de vous inscrire. Veuillez compléter votre profil militaire pour que l'administrateur puisse le valider.\n- **Modifications à Valider** : Vous avez soumis des corrections. L'administration doit les approuver.\n- **Validé** : Votre profil est actif et vous pouvez maintenant ajouter vos membres à charge (conjoint/enfants).\n- **Rejeté** : Veuillez vérifier vos informations de profil et soumettre à nouveau.";
    } else if (text.includes('contact') || text.includes('adresse') || text.includes('telephone') || text.includes('téléphone') || text.includes('mail') || text.includes('support')) {
      reply = "Vous pouvez contacter l'assistance de la CAMA par email à **support@sappay.net** ou vous rendre au secrétariat de la direction générale de la CAMA pour toute question relative à vos dossiers physiques.";
    } else if (text.includes('bonjour') || text.includes('salut') || text.includes('hello')) {
      reply = "Bonjour ! Je suis le conseiller virtuel de la CAMA. Je suis là pour vous aider dans vos démarches d'enrôlement ou d'accès à vos prestations de santé.";
    } else if (text.includes('merci') || text.includes('parfait') || text.includes('ok')) {
      reply = "Je vous en prie ! N'hésitez pas si vous avez d'autres questions sur vos dossiers de prise en charge ou d'enrôlement.";
    } else {
      reply = "J'ai bien pris note de votre message concernant l'assurance maladie des armées (CAMA). Pourriez-vous préciser si votre demande concerne l'inscription initiale, la validation de votre profil militaire, ou l'enrôlement d'un membre de famille (FIF) ?";
    }

    res.json({ reply });
  });

  const HARDCODED_SUPER_ADMINS = [
    {
      id: -1,
      name: "Support SapPay",
      email: "support@sappay.net",
      status: "Actif",
      role: "Super Admin",
      permissions: ["site_settings", "dossiers", "users", "centres", "news", "settings"],
      created_date: "25 Juin 2026",
      createdDate: "25 Juin 2026"
    },
    {
      id: -2,
      name: "Mohamed Mande",
      email: "mandemohamed68@gmail.com",
      status: "Actif",
      role: "Super Admin",
      permissions: ["site_settings", "dossiers", "users", "centres", "news", "settings"],
      created_date: "25 Juin 2026",
      createdDate: "25 Juin 2026"
    },
    {
      id: -3,
      name: "SFankany",
      email: "sfankany@sappay.net",
      status: "Actif",
      role: "Super Admin",
      permissions: ["site_settings", "dossiers", "users", "centres", "news", "settings"],
      created_date: "25 Juin 2026",
      createdDate: "25 Juin 2026"
    }
  ];

  // Admin users (Admins) API endpoint
  app.get('/api/admins', async (req, res) => {
    try {
      const admins = await dbAll('SELECT * FROM admin_users');
      // map permissions back from JSON
      const mapped = admins.map(a => ({
        ...a,
        permissions: JSON.parse(a.permissions || '[]'),
        createdDate: a.created_date || ""
      }));

      const dbAdmins = mapped.filter(a => 
        !['support@sappay.net', 'mandemohamed68@gmail.com', 'sfankany@sappay.net'].includes(a.email.toLowerCase().trim())
      );

      res.json([...HARDCODED_SUPER_ADMINS, ...dbAdmins]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admins', async (req, res) => {
    const a = req.body;
    try {
      if (['support@sappay.net', 'mandemohamed68@gmail.com', 'sfankany@sappay.net'].includes(a.email.toLowerCase().trim())) {
        return res.status(400).json({ error: 'Cet email est réservé pour un Super Administrateur système et ne peut être créé en BDD.' });
      }
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
      const idNum = Number(req.params.id);
      if (idNum < 0 || idNum === 1 || ['support@sappay.net', 'mandemohamed68@gmail.com', 'sfankany@sappay.net'].includes(a.email.toLowerCase().trim())) {
        return res.status(403).json({ error: 'Ce Super Administrateur système ne peut pas être modifié.' });
      }
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
      const idNum = Number(req.params.id);
      if (idNum < 0 || idNum === 1) {
        return res.status(403).json({ error: 'Ce Super Administrateur système ne peut pas être supprimé.' });
      }
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
