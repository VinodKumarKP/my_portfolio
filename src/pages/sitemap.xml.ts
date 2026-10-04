import { getCollection } from 'astro:content';

export async function GET() {
  const projects = await getCollection('projects');

  const staticPages = [
    '',
    '/about',
    '/projects',
  ];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>https://your-domain.com${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${projects.map(project => `
  <url>
    <loc>https://your-domain.com/projects/${project.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`.trim();

  return new Response(sitemapContent, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
