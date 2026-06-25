import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

function escapeString(val) {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'number') {
    return val.toString();
  }
  // Escape single quotes by doubling them for safe SQL insertion
  const escaped = val.replace(/'/g, "''");
  return `'${escaped}'`;
}

async function main() {
  const dbPath = path.resolve(process.cwd(), 'cama.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error(`Error: SQLite database file not found at ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  console.log('Connected to SQLite database for dumping...');

  const tables = [
    'users',
    'requests',
    'admin_users',
    'centres',
    'articles',
    'site_settings',
    'action_logs'
  ];

  let sqlDump = `-- =========================================================\n`;
  sqlDump += `-- CAMA BURKINA FASO - MARIADB/MYSQL DATA DUMP\n`;
  sqlDump += `-- Generated on: ${new Date().toLocaleString('fr-FR')}\n`;
  sqlDump += `-- Suitable for local MariaDB injection\n`;
  sqlDump += `-- =========================================================\n\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  for (const table of tables) {
    sqlDump += `-- ---------------------------------------------------------\n`;
    sqlDump += `-- Table: ${table}\n`;
    sqlDump += `-- ---------------------------------------------------------\n`;
    sqlDump += `TRUNCATE TABLE \`${table}\`;\n\n`;

    try {
      // Get all columns of the table to maintain column order
      const columnsInfo = db.prepare(`PRAGMA table_info(\`${table}\`)`).all();
      const columnNames = columnsInfo.map(c => c.name);

      const rows = db.prepare(`SELECT * FROM \`${table}\``).all();
      
      if (rows.length > 0) {
        const columnList = columnNames.map(col => `\`${col}\``).join(', ');
        sqlDump += `INSERT INTO \`${table}\` (\n  ${columnList}\n) VALUES\n`;
        
        const valueStrings = rows.map((row, index) => {
          const values = columnNames.map(col => escapeString(row[col]));
          const isLast = index === rows.length - 1;
          return `  (${values.join(', ')})${isLast ? ';' : ','}`;
        });

        sqlDump += valueStrings.join('\n') + '\n\n';
        console.log(`Dumped ${rows.length} rows from table "${table}"`);
      } else {
        sqlDump += `-- (Table "${table}" is currently empty)\n\n`;
        console.log(`Table "${table}" is empty, skipped insert generation.`);
      }
    } catch (err) {
      console.error(`Error dumping table ${table}:`, err.message);
    }
  }

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  const outputPath = path.resolve(process.cwd(), 'database_setup/mariadb_data_dump.sql');
  fs.writeFileSync(outputPath, sqlDump, 'utf8');
  console.log(`\nSuccess! MariaDB SQL dump successfully created at: ${outputPath}`);
}

main().catch(err => {
  console.error('An unexpected error occurred:', err);
});
