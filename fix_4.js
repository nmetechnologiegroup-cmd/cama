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
  [/onClick=\{async \(\) => \{\n\s*e\.preventDefault\(\);/g, "onClick={async (e) => {\n                  e.preventDefault();"]
]);

replaceInFile('src/pages/Contact.tsx', [
  [/import React, \{ useState, useEffect \} from 'react';\nimport React, \{ useState, useEffect \} from 'react';/g, "import React, { useState, useEffect } from 'react';"],
  [/import \{ useState, useEffect \} from 'react';\nimport \{ useState, useEffect \} from 'react';/g, "import { useState, useEffect } from 'react';"],
  [/import \{ useState, useEffect \} from 'react';\nimport React, \{ useState, useEffect \} from 'react';/g, "import React, { useState, useEffect } from 'react';"],
  [/import React, \{ useState, useEffect, useEffect \} from 'react';/g, "import React, { useState, useEffect } from 'react';"]
]);

replaceInFile('src/pages/Home.tsx', [
  [/onClick=\{async \(\) => \{\n\s*const settings = await getSiteSettings\(\);/g, "onClick={async () => {\n                  const settings = await getSiteSettings();"],
  [/onClick=\{async \(\) => \{\n\s*const articles = await getArticles\(\);/g, "onClick={async () => {\n                  const articles = await getArticles();"],
  [/onSubmit=\{async \(\) => \{/g, "onSubmit={async (e) => {"],
  [/onClick=\{async \(\) => \{/g, "onClick={async (e) => {"],
  [/onSubmit=\{async \(e\) => \{\n\s*e\.preventDefault/g, "onSubmit={async (e) => {\n    e.preventDefault"]
]);

replaceInFile('src/pages/Login.tsx', [
  [/onSubmit=\{async \(\) => \{/g, "onSubmit={async (e) => {"],
  [/onClick=\{async \(\) => \{/g, "onClick={async (e) => {"],
  [/onSubmit=\{async \(e\) => \{\n\s*e\.preventDefault/g, "onSubmit={async (e) => {\n    e.preventDefault"],
  [/const userMatch = users\?/g, "const users = await getUsers();\n      const userMatch = users"],
  [/const adminMatch = \(await getAdminUsers\(\)\)\.find/g, "const admins = await getAdminUsers();\n      const adminMatch = admins.find"]
]);

replaceInFile('src/pages/News.tsx', [
  [/import \{ useState, useMemo \} from 'react';/g, "import { useState, useMemo, useEffect } from 'react';"],
  [/import \{ useMemo, useEffect \} from 'react';/g, "import { useState, useMemo, useEffect } from 'react';"]
]);

replaceInFile('src/pages/NewsDetail.tsx', [
  [/import \{ useParams, Link \} from 'react-router-dom';/g, "import React, { useState, useEffect } from 'react';\nimport { useParams, Link } from 'react-router-dom';"]
]);

replaceInFile('src/pages/admin/AdminDossiers.tsx', [
  [/const selectedUser = user\?/g, "const users = await getUsers();\n    const selectedUser = users"],
  [/const selectedUser = users\?/g, "const users = await getUsers();\n    const selectedUser = users"],
  [/setRequests\(await addRequest\(newReq\)\);/g, "addRequest(newReq).then(setRequests);"],
  [/requests\.map\(/g, "((requests as any) || []).map("],
  [/onClick=\{async \(\) => \{/g, "onClick={async (e) => {"],
  [/onSubmit=\{async \(\) => \{/g, "onSubmit={async (e) => {"],
  [/onClick=\{async \(e\) => \{\n\s*e\.preventDefault/g, "onClick={async (e) => {\n                              e.preventDefault"]
]);

replaceInFile('src/pages/admin/AdminUsers.tsx', [
  [/onSubmit=\{async \(\) => \{/g, "onSubmit={async (e) => {"],
  [/onClick=\{async \(\) => \{/g, "onClick={async (e) => {"]
]);

