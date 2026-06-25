import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/}, { useState, useEffect } from 'react';/g, "} from 'react';");
  content = content.replace(/}, { useEffect } from 'react';/g, "} from 'react';");
  content = content.replace(/import { useState, useEffect } from 'react';\nimport React, {/g, "import React, { useState, useEffect,");

  if (content !== originalContent) {
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
