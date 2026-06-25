import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (content.includes('const [settings, setSettings] = useState<any>(null);')) {
      content = content.replace('const [settings, setSettings] = useState<any>(null);', 'const [settings, setSettings] = useState<any>(DEFAULT_SITE_SETTINGS);');
      
      // make sure DEFAULT_SITE_SETTINGS is imported
      if (!content.includes('DEFAULT_SITE_SETTINGS')) {
          if (content.includes('getSiteSettings')) {
              content = content.replace('getSiteSettings', 'getSiteSettings, DEFAULT_SITE_SETTINGS');
          }
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
