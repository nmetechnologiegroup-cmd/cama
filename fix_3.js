import fs from 'fs';
import path from 'path';

function replaceInFile(file, replacements) {
  let p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  let original = content;
  for (const [search, replace] of replacements) {
    if (search instanceof RegExp) {
        content = content.replace(search, replace);
    } else {
        content = content.split(search).join(replace);
    }
  }
  if (content !== original) {
      fs.writeFileSync(p, content, 'utf8');
  }
}

replaceInFile('src/layouts/MainLayout.tsx', [
  [/const handleSubmit = \(e: React.FormEvent\) =>/g, "const handleSubmit = async (e: React.FormEvent) =>"],
  [/e\s*as\s*any\s*\.\s*preventDefault/g, "e.preventDefault"]
]);

replaceInFile('src/pages/Contact.tsx', [
  [/import React, { useState, useEffect } from 'react';/g, ""],
  [/import { useState, useEffect } from 'react';\n/g, ""],
  [/import React, { useEffect } from 'react';/g, "import React, { useState, useEffect } from 'react';"]
]);

replaceInFile('src/pages/Home.tsx', [
  [/const handleNewsletterSubmit = \(e: React.FormEvent\) =>/g, "const handleNewsletterSubmit = async (e: React.FormEvent) =>"],
  [/const handleContactSubmit = \(e: React.FormEvent\) =>/g, "const handleContactSubmit = async (e: React.FormEvent) =>"]
]);

replaceInFile('src/pages/Login.tsx', [
  [/const handleLogin = \(e: React.FormEvent\) =>/g, "const handleLogin = async (e: React.FormEvent) =>"],
  [/const adminMatch = user\?.find/g, "const adminMatch = (await getAdminUsers()).find"]
]);

replaceInFile('src/pages/News.tsx', [
  [/import { useState, useMemo, useEffect } from 'react';/g, "import { useMemo, useEffect } from 'react';"],
  [/import { useState, useEffect } from 'react';/g, ""],
  [/import { useState, useMemo } from 'react';/g, "import { useState, useMemo, useEffect } from 'react';"]
]);

replaceInFile('src/pages/NewsDetail.tsx', [
  [/import React from 'react';/g, ""],
  [/import React, { useState, useEffect } from 'react';/g, "import React, { useState, useEffect } from 'react';"]
]);

replaceInFile('src/pages/admin/AdminDossiers.tsx', [
  [/const handleApprove = \(e: React.MouseEvent\) =>/g, "const handleApprove = async (e: React.MouseEvent) =>"],
  [/const handleReject = \(e: React.MouseEvent\) =>/g, "const handleReject = async (e: React.MouseEvent) =>"],
  [/const users = await getUsers\(\)/g, "const users = await getUsers()"],
  [/const users = getUsers\(\)/g, "const users = await getUsers()"]
]);

replaceInFile('src/pages/admin/AdminUsers.tsx', [
  [/const handleSave = \(\) =>/g, "const handleSave = async () =>"],
  [/const handleDelete = \(id: number\) =>/g, "const handleDelete = async (id: number) =>"]
]);

