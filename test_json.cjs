const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database('cama.db');
const sql = fs.readFileSync('database_setup/sqlite_setup.sql', 'utf8');
sql.split(';').filter(s => s.trim().length > 0).forEach(s => {
  try {
    db.prepare(s).run();
  } catch (e) {
    if (!e.message.includes('DROP TABLE')) {
      console.error('SQL error:', e.message);
    }
  }
});
const row = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
['prestations', 'about_content', 'statistics', 'testimonials', 'partners', 'menu_visibility', 'section_titles', 'footer'].forEach(col => {
  try {
    JSON.parse(row[col]);
  } catch (e) {
    console.error('Error parsing column', col, ':', e.message);
    console.error(row[col]);
  }
});
