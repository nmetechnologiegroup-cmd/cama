import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add missing imports
  if (!content.includes('import { useState') && !content.includes('import React, {') && content.includes('useState')) {
     content = `import { useState, useEffect } from 'react';\n` + content;
  }
  
  if (content.includes('import React from') || content.includes('import React, {')) {
     if (content.includes('useState') && !content.includes('useState,')) {
         content = content.replace(/import React(.*?)\s*from 'react';/, "import React$1, { useState, useEffect } from 'react';");
     } else if (content.includes('useEffect') && !content.includes('useEffect,')) {
         content = content.replace(/import React(.*?)\s*from 'react';/, "import React$1, { useEffect } from 'react';");
     }
  }

  // Also make sure to add useState, useEffect directly if missing
  if (content.match(/import\s*{([^}]+)}\s*from\s*'react'/)) {
      let reactImports = content.match(/import\s*{([^}]+)}\s*from\s*'react'/)[1];
      if (content.includes('useState') && !reactImports.includes('useState')) {
          content = content.replace(reactImports, reactImports + ', useState');
      }
      if (content.includes('useEffect') && !reactImports.includes('useEffect')) {
          content = content.replace(reactImports, reactImports + ', useEffect');
      }
  }

  // Remove `await` inside Dashboard or Home components where it's at the top level of the component body
  // e.g. const allRequests = await getRequests(); 
  // We already replaced it in refactor.js to state! Wait, did we?
  // Let's check why there is `const allRequests = await getRequests();` inside Dashboard.tsx(100,25)
  // It was probably inside the render body. We should replace it with state!
  
  // Actually, I can just run a regex to remove await outside of async functions
  // Or since we already have `const [requests, setRequests] = useState([])`
  // We can just remove `const allRequests = await getRequests();` and replace `allRequests` with `requests`.
  
  if (content.includes('const allRequests = await getRequests();')) {
      content = content.replace('const allRequests = await getRequests();', '');
      content = content.replace(/allRequests/g, 'requests');
  }

  if (content.includes('const users = await getUsers();')) {
      content = content.replace('const users = await getUsers();', '');
      content = content.replace(/users\.find/g, 'users?.find');
  }

  if (content.includes('const articles = await getArticles();')) {
      content = content.replace('const articles = await getArticles();', '');
  }

  // In Home.tsx: const allArticles = await getArticles();
  if (content.includes('const allArticles = await getArticles();')) {
      content = content.replace('const allArticles = await getArticles();', '');
      content = content.replace(/allArticles/g, 'articles');
  }
  
  // In Home.tsx: const settings = await getSiteSettings();
  if (content.includes('const settings = await getSiteSettings();')) {
      content = content.replace('const settings = await getSiteSettings();', '');
  }
  
  if (content.includes('const allArticles = await getArticlesList();')) {
       content = content.replace('const allArticles = await getArticlesList();', '');
  }

  // replace setallArticles with setArticles
  content = content.replace(/setallArticles/g, 'setArticles');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
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
        fixFile(fullPath);
      }
    }
  }
}

walkDir(path.resolve(process.cwd(), 'src/pages'));
walkDir(path.resolve(process.cwd(), 'src/components'));
walkDir(path.resolve(process.cwd(), 'src/layouts'));

