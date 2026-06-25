import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (content.includes('DEFAULT_SITE_SETTINGS')) {
    if (content.includes('getSiteSettings') && !content.includes('DEFAULT_SITE_SETTINGS,') && !content.includes(', DEFAULT_SITE_SETTINGS')) {
       // if we have 'getSiteSettings' in the import from dataStore, add DEFAULT_SITE_SETTINGS
       content = content.replace('getSiteSettings,', 'getSiteSettings, DEFAULT_SITE_SETTINGS,');
       content = content.replace(/getSiteSettings(\n\s*)} from '\.\.\/\.\.\/lib\/dataStore'/, 'getSiteSettings,$1  DEFAULT_SITE_SETTINGS$1} from \'../../lib/dataStore\'');
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

walkDir(path.resolve(process.cwd(), 'src'));
