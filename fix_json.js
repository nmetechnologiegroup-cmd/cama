import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(
    /const session = JSON\.parse\(sessionStr\);/g,
    `let session = null;
    try {
      session = JSON.parse(sessionStr);
    } catch (e) {
      navigate('/login');
      return;
    }`
  );
  
  content = content.replace(
    /if \(saved\) return JSON\.parse\(saved\);/g,
    `if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore and fall through
      }
    }`
  );

  content = content.replace(
    /return JSON\.parse\(stored\);/g,
    `try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_NOTIFICATION_TEMPLATES;
    }`
  );

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
