import fs from 'fs';
import path from 'path';

function fixFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

fixFile('src/pages/Home.tsx', [
  [
`  const [settings, setSettings] = useState(() => getSiteSettings());
  const [showModal, setShowModal] = useState(() => {
    const s = await getSiteSettings();
    if (!s.popupActive) return false;
    const views = Number(safeStorage.getItem('cama_popup_views') || '0');
    const maxViews = s.popupMaxViews !== undefined ? s.popupMaxViews : 2;
    return views < maxViews;
  });`,
`  const [settings, setSettings] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    getSiteSettings().then(s => {
      setSettings(s);
      if (s.popupActive) {
        const views = Number(safeStorage.getItem('cama_popup_views') || '0');
        const maxViews = s.popupMaxViews !== undefined ? s.popupMaxViews : 2;
        if (views < maxViews) setShowModal(true);
      }
    });
  }, []);`
  ],
  [
`  useEffect(() => {
    // Increment popup count on mount if visible
    if (showModal) {
      const views = Number(safeStorage.getItem('cama_popup_views') || '0');
      safeStorage.setItem('cama_popup_views', String(views + 1));
    }
  }, [showModal]);`,
`  useEffect(() => {
    if (showModal) {
      const views = Number(safeStorage.getItem('cama_popup_views') || '0');
      safeStorage.setItem('cama_popup_views', String(views + 1));
    }
  }, [showModal]);`
  ],
  [
`  useEffect(() => {
    // Synchroniser en temps réel les réglages du backoffice CAMA
    setSettings(getSiteSettings());
    
    const handleSyncSettings = () => {
      const freshSettings = await getSiteSettings();`,
`  useEffect(() => {
    const handleSyncSettings = async () => {
      const freshSettings = await getSiteSettings();`
  ],
  [
`  const [allArticles, setArticles] = useState<any[]>([]);
  useEffect(() => { getArticles().then(setArticles); }, []);
  useEffect(() => { getArticles().then(setArticles); }, []);
  const publishedArticles = useMemo(() => allArticles.filter(a => a.status === 'Publié'), [allArticles]);`,
`  const [allArticles, setArticles] = useState<any[]>([]);
  useEffect(() => { getArticles().then(setArticles); }, []);
  const publishedArticles = useMemo(() => allArticles.filter(a => a.status === 'Publié'), [allArticles]);`
  ]
]);

fixFile('src/pages/Login.tsx', [
  [`const [users, setUsers] = useState<any[]>([]);\n  useEffect(() => { getUsers().then(setUsers); }, []);`, ``],
  [`const userMatch = users?`, `const users = await getUsers();\n      const userMatch = users`]
]);

fixFile('src/pages/News.tsx', [
  [`import { useMemo, useEffect } from 'react';\nimport { useMemo, useEffect } from 'react';`, `import { useState, useMemo, useEffect } from 'react';`],
  [`import { useState, useMemo, useEffect } from 'react';\nimport { useState, useMemo, useEffect } from 'react';`, `import { useState, useMemo, useEffect } from 'react';`]
]);

fixFile('src/pages/NewsDetail.tsx', [
  [`import React, { useState, useEffect } from 'react';\nimport React, { useState, useEffect } from 'react';`, `import React, { useState, useEffect } from 'react';`]
]);

fixFile('src/pages/admin/AdminDossiers.tsx', [
  [
`      const users = await getUsers();
      const selectedUser = users.find(u => u.matricule === request.matricule);`,
`      const users = await getUsers();
      const selectedUser = users.find(u => u.matricule === request.matricule);`
  ]
]);

fixFile('src/pages/Contact.tsx', [
  [`import React, { useState, useEffect } from 'react';\nimport React, { useState, useEffect } from 'react';`, `import React, { useState, useEffect } from 'react';`]
]);
