import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace synchronous initializations in useState
  content = content.replace(/useState<([^>]+)>\(\(\) => get([A-Za-z]+)\(\)\)/g, 'useState<$1>([])');
  
  // Replace useMemo with useEffect for data loading
  content = content.replace(/const ([a-zA-Z]+) = useMemo\(\(\) => get([A-Za-z]+)\(\), \[\]\);/g, 
    'const [$1, set$1] = useState<any[]>([]);\n  useEffect(() => { get$2().then(set$1); }, []);');

  // If we changed to useEffect but useEffect is not imported, import it
  if (originalContent !== content && !content.includes('useEffect')) {
    content = content.replace(/import React, { ([^}]+) } from 'react';/, "import React, { $1, useEffect } from 'react';");
    content = content.replace(/import { ([^}]+) } from 'react';/, "import { $1, useEffect } from 'react';");
  }

  // Inject useEffect to load data
  // Look for: const [requests, setRequests] = useState<Request[]>([]);
  // and inject: useEffect(() => { getRequests().then(setRequests); }, []);
  const matches = [...content.matchAll(/const \[([a-zA-Z]+), (set[a-zA-Z]+)\] = useState<[^>]+>\(\[\]\);/g)];
  for (const match of matches) {
    const varName = match[1]; // requests, users, etc.
    const setterName = match[2]; // setRequests, setUsers, etc.
    const capitalizedName = varName.charAt(0).toUpperCase() + varName.slice(1);
    
    // Check if we already injected useEffect for this variable
    if (!content.includes(`get${capitalizedName}().then(${setterName})`)) {
      // Find the position after the useState line
      const useStateLine = match[0];
      content = content.replace(useStateLine, `${useStateLine}\n  useEffect(() => { get${capitalizedName}().then(${setterName}); }, []);`);
    }
  }

  // Handle getSiteSettings()
  content = content.replace(/useState<SiteWebSettings>\(\(\) => getSiteSettings\(\)\)/g, "useState<SiteWebSettings | null>(null)");
  if (content.includes('setSettings(await saveSiteSettings(settings))') || content.includes('getSiteSettings().then')) {
      // do nothing
  } else if (content.includes('useState<SiteWebSettings | null>(null)') && !content.includes('getSiteSettings().then(setSettings)')) {
     content = content.replace(/const \[settings, setSettings\] = useState<SiteWebSettings \| null>\(null\);/, 
     "const [settings, setSettings] = useState<any>(null);\n  useEffect(() => { getSiteSettings().then(setSettings); }, []);");
  }

  // Replace getSiteSettings() without useState
  content = content.replace(/const settings = getSiteSettings\(\);/g, 
     "const [settings, setSettings] = useState<any>(null);\n  useEffect(() => { getSiteSettings().then(setSettings); }, []);");
  
  // Update sync add/edit/delete that assigned results immediately
  // e.g. const updated = addRequest(newReq); setRequests(updated);
  // -> addRequest(newReq).then(setRequests);
  content = content.replace(/const updated = ([a-zA-Z]+)\(([^)]+)\);\n\s*set([a-zA-Z]+)\(updated\);/g, 
    "$1($2).then(set$3);");

  // e.g. setRequests(updateRequestStatus(request.id, 'Validé'));
  content = content.replace(/set([a-zA-Z]+)\(([a-zA-Z]+)\(([^)]+)\)\);/g, 
    "$2($3).then(set$1);");

  // Replace direct synchronous calls inside handlers
  // const users = getUsers(); -> const users = await getUsers();
  content = content.replace(/const ([a-zA-Z]+) = get([a-zA-Z]+)\(\);/g, "const $1 = await get$2();");

  // Fix any "await get" inside non-async functions by making the enclosing arrow function async
  // E.g. onClick={() => { const users = await getUsers(); ... }}
  content = content.replace(/onClick=\{\(\) => \{/g, "onClick={async () => {");
  content = content.replace(/onSubmit=\{\(\w+\) => \{/g, "onSubmit={async ($1) => {");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (!fullPath.includes('dataStore.ts')) {
        processFile(fullPath);
      }
    }
  }
}

walkDir(path.resolve(process.cwd(), 'src/pages'));
walkDir(path.resolve(process.cwd(), 'src/components'));
walkDir(path.resolve(process.cwd(), 'src/layouts'));

