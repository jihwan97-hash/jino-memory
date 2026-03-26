#!/usr/bin/env node
/**
 * blog-writer/scripts/deploy-post.js
 * 
 * Takes a finished draft HTML file and deploys it to astinclaw.pw
 * Also updates blog/index.html posts array.
 * 
 * Usage: node deploy-post.js --slug <slug> --title "<title>" --date "<date>" --html <path-to-html>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BLOG_DIR = '/Users/astin/Projects/astinclaw-web/blog';
const INDEX_HTML = path.join(BLOG_DIR, 'index.html');

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : null;
}

const slug = getArg('--slug');
const title = getArg('--title');
const date = getArg('--date');
const htmlPath = getArg('--html');

if (!slug || !title || !date || !htmlPath) {
  console.error('Usage: deploy-post.js --slug <slug> --title "<title>" --date "<date>" --html <path>');
  process.exit(1);
}

// 1. Copy HTML to blog/<slug>/index.html
const postDir = path.join(BLOG_DIR, slug);
fs.mkdirSync(postDir, { recursive: true });
fs.copyFileSync(htmlPath, path.join(postDir, 'index.html'));
console.log(`✅ Post copied to ${postDir}/index.html`);

// 2. Update blog/index.html posts array (inject at top of array)
let indexContent = fs.readFileSync(INDEX_HTML, 'utf8');
const newEntry = `\n      {\n        date: "${date}",\n        title: "${title}",\n        slug: "${slug}"\n      },`;
indexContent = indexContent.replace(
  /const posts = \[/,
  `const posts = [${newEntry}`
);
fs.writeFileSync(INDEX_HTML, indexContent, 'utf8');
console.log(`✅ blog/index.html updated`);

// 3. Git commit + Vercel deploy
try {
  execSync(`cd /Users/astin/Projects/astinclaw-web && git add -A && git commit -m "blog: publish '${title}'"`, { stdio: 'inherit' });
  execSync(`cd /Users/astin/Projects/astinclaw-web && npx vercel --prod --yes`, { stdio: 'inherit' });
  console.log(`🚀 Deployed: https://astinclaw.pw/blog/${slug}`);
} catch (e) {
  console.error('Deploy failed:', e.message);
  process.exit(1);
}
