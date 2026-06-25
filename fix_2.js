import fs from 'fs';
import path from 'path';

function replaceInFile(file, replacements) {
  let p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(p, content, 'utf8');
}

replaceInFile('src/layouts/MainLayout.tsx', [
  ['e.preventDefault()', '(e as any).preventDefault()']
]);

replaceInFile('src/pages/Contact.tsx', [
  ["import { useState, useEffect } from 'react';\nimport React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';"]
]);

replaceInFile('src/pages/Home.tsx', [
  ["const handleNewsletterSubmit = (e: React.FormEvent) => {", "const handleNewsletterSubmit = async (e: React.FormEvent) => {"],
  ["const handleContactSubmit = (e: React.FormEvent) => {", "const handleContactSubmit = async (e: React.FormEvent) => {"],
  ["getAllArticles", "getArticles"]
]);

replaceInFile('src/pages/Login.tsx', [
  ["const handleLogin = (e: React.FormEvent) => {", "const handleLogin = async (e: React.FormEvent) => {"],
  ["const users = getUsers();", "const users = await getUsers();"],
  ["const users = await getUsers();", "const users = await getUsers();"]
]);

replaceInFile('src/pages/News.tsx', [
  ["import { useState, useEffect } from 'react';\nimport { useState, useMemo }", "import { useState, useMemo, useEffect }"],
  ["getArticlesList", "getArticles"]
]);

replaceInFile('src/pages/NewsDetail.tsx', [
  ["import React from 'react';", "import React, { useState, useEffect } from 'react';"]
]);

replaceInFile('src/pages/admin/AdminDossiers.tsx', [
  ["const handleApprove = (e: React.MouseEvent) => {", "const handleApprove = async (e: React.MouseEvent) => {"],
  ["const handleReject = (e: React.MouseEvent) => {", "const handleReject = async (e: React.MouseEvent) => {"],
  ["addRequest(newReq).then(setRequests);", "addRequest(newReq).then(setRequests);"],
  ["requests.map(", "((requests as any) || []).map("]
]);

replaceInFile('src/pages/admin/AdminUsers.tsx', [
  ["getAdmins()", "getAdminUsers()"],
  ["getTemplates()", "getNotificationTemplates()"],
  ["onClick={() => {", "onClick={async () => {"],
  ["const handleDelete = (id: number) => {", "const handleDelete = async (id: number) => {"]
]);
