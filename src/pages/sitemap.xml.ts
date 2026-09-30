/**
 * sitemap.xml généré au build, à partir des routes du site (référencé dans public/robots.txt).
 * lastmod : date de mise à jour de la page si elle est définie, sinon date du build.
 */
import type { APIRoute } from 'astro';
import { ROUTES, UPDATED, absoluteUrl, type PageKey } from '../data/site';

export const GET: APIRoute = () => {
  const buildDate = new Date().toISOString().slice(0, 10);
  const urls = (Object.keys(ROUTES) as PageKey[])
    .map((key) => {
      const lastmod = UPDATED[key] ?? buildDate;
      return `  <url>\n    <loc>${absoluteUrl(ROUTES[key])}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
