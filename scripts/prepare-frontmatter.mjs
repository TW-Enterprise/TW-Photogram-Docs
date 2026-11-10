import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_DIR = '/tmp/TW-Photogram-Docs/src/content/docs';

function walk(dir) {
  let files = [];
  for (const item of readdirSync(dir)) {
    const full = join(dir, item);
    if (statSync(full).isDirectory()) {
      files = files.concat(walk(full));
    } else if (full.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(DOCS_DIR);

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  if (content.startsWith('---')) {
    continue; // already has frontmatter
  }

  // Extract first h1
  const h1Match = content.match(/^#\s+(.+)$/m);
  let title = 'Dokumentasi TW Photogram';
  if (h1Match) {
    title = h1Match[1].trim();
  }

  // Extract first paragraph for description
  const paragraphs = content.split('\n\n');
  let description = `Dokumentasi dan panduan resmi TW Photogram untuk ${title}.`;
  for (const p of paragraphs) {
    const trimmed = p.replace(/^#+.*$/m, '').replace(/^>.*$/m, '').trim();
    if (trimmed.length > 20 && !trimmed.startsWith('|') && !trimmed.startsWith('```')) {
      description = trimmed.slice(0, 160).replace(/[*_`[\]]/g, '').trim() + '...';
      break;
    }
  }

  // Remove the initial # heading from content so it doesn't duplicate Starlight's h1
  content = content.replace(/^#\s+(.+)$/m, '').trimStart();

  const frontmatter = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
---

`;

  writeFileSync(file, frontmatter + content, 'utf8');
  console.log(`[frontmatter] updated ${file} -> ${title}`);
}
