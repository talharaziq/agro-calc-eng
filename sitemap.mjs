import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SITE_URL = 'https://agrocalculator.pp.ua';

if (!fs.existsSync(DIST) || !fs.statSync(DIST).isDirectory()) {
  throw new Error('Build output directory "dist" was not found. Run the site build first.');
}

function listHtmlFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      listHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function fallbackPath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) {
    return `/${normalized.slice(0, -'index.html'.length)}`;
  }
  return `/${normalized}`;
}

function isNoIndex(html) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return metaTags.some(tag =>
    /\bname=["']robots["']/i.test(tag) &&
    /\bcontent=["'][^"']*\bnoindex\b/i.test(tag)
  );
}

function pagePath(html, relativePath) {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const canonicalTag = linkTags.find(tag => /\brel=["']canonical["']/i.test(tag));
  const canonicalHref = canonicalTag?.match(/\bhref=["']([^"']+)["']/i)?.[1];

  let pathname = fallbackPath(relativePath);
  if (canonicalHref) {
    try {
      // Keep the canonical path, but always publish it on the site's real domain.
      pathname = new URL(canonicalHref, SITE_URL).pathname;
    } catch {
      // Fall back to the generated file path if the canonical value is malformed.
    }
  }

  pathname = pathname.replace(/\/{2,}/g, '/');
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  if (/^\/404(?:\.html|\/)?$/i.test(pathname)) return null;
  return pathname;
}

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const urls = new Set();
for (const filePath of listHtmlFiles(DIST)) {
  const relativePath = path.relative(DIST, filePath);
  const html = fs.readFileSync(filePath, 'utf8');

  if (isNoIndex(html)) continue;
  const pathname = pagePath(html, relativePath);
  if (!pathname) continue;

  urls.add(new URL(pathname, `${SITE_URL}/`).href);
}

const sortedUrls = [...urls].sort((a, b) => {
  if (a === `${SITE_URL}/`) return -1;
  if (b === `${SITE_URL}/`) return 1;
  return a.localeCompare(b);
});

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sortedUrls.map(url => `  <url><loc>${xmlEscape(url)}</loc></url>`),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');
fs.writeFileSync(
  path.join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  'utf8'
);

console.log(`Generated sitemap.xml with ${sortedUrls.length} indexable HTML pages.`);
console.log(`Sitemap: ${SITE_URL}/sitemap.xml`);
