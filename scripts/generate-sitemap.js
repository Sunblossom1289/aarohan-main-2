import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://myaarohan.com';
const today = new Date().toISOString().split('T')[0];

// Static pages with priority and change frequency
const staticPages = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/articles', changefreq: 'weekly', priority: '0.8' },
  { loc: '/career-explorer', changefreq: 'monthly', priority: '0.8' },
  { loc: '/student-login', changefreq: 'monthly', priority: '0.6' },
  { loc: '/counselor-login', changefreq: 'monthly', priority: '0.6' },
];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// Add static pages
for (const page of staticPages) {
  sitemap += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

// Add article pages (if articles have individual URLs in the future)
try {
  const articlesIndex = JSON.parse(fs.readFileSync('./public/articles/index.json', 'utf-8'));
  for (const filename of articlesIndex) {
    try {
      const article = JSON.parse(fs.readFileSync(`./public/articles/${filename}`, 'utf-8'));
      const lastmod = article.date ? new Date(article.date).toISOString().split('T')[0] : today;
      sitemap += `
  <url>
    <loc>${BASE_URL}/articles/${article.id || filename.replace('.json', '')}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    } catch (err) {
      console.warn(`Skipping article ${filename}: ${err.message}`);
    }
  }
} catch (err) {
  console.warn('Could not load articles index:', err.message);
}

sitemap += `
</urlset>`;

fs.writeFileSync('./public/sitemap.xml', sitemap);
console.log('✅ Sitemap generated at public/sitemap.xml');
