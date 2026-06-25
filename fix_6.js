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

replaceInFile('src/pages/admin/AdminUsers.tsx', [
  [/const handleSave = \(e: FormEvent\) =>/g, "const handleSave = async (e: FormEvent) =>"],
  [/const result = editUser\(/g, "const result = await editUser("],
  [/const result = addUser\(/g, "const result = await addUser("]
]);

replaceInFile('src/pages/admin/AdminDossiers.tsx', [
  [/const updated = await updateRequestStatus\(/g, "const updated = await updateRequestStatus("],
  [/const updated = updateRequestStatus\(/g, "const updated = await updateRequestStatus("],
  [/const handleValidate = \(id:/g, "const handleValidate = async (id:"]
]);

