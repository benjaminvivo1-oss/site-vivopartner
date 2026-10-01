/**
 * Vérifie, après le build, que la politique de sécurité du contenu (CSP) de vercel.json autorise
 * chaque script des pages produites : hachage sha256 pour les scripts en ligne, origine pour les
 * scripts externes. Lancé par `npm run build` : si un script change sans que vercel.json suive,
 * le build échoue (Vercel garde alors la version en ligne) au lieu de publier un site dont un
 * script serait bloqué par le navigateur.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const csp = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value;
if (!csp) {
  console.error('check-csp : aucune Content-Security-Policy dans vercel.json.');
  process.exit(1);
}
const scriptSrc = (
  csp
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('script-src ')) ?? ''
)
  .split(/\s+/)
  .slice(1);

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.html')) pages.push(path);
  }
})(join(root, 'dist'));

const problems = new Map();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/ld\+json"/.test(attrs)) continue;
    const src = attrs.match(/\bsrc="([^"]+)"/)?.[1];
    let problem = '';
    if (src) {
      if (/^https?:\/\//.test(src) && !scriptSrc.includes(new URL(src).origin))
        problem = `script externe non autorisé : ajouter ${new URL(src).origin} à script-src`;
    } else {
      const hash = `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;
      if (!scriptSrc.includes(hash)) problem = `script en ligne non autorisé : ajouter ${hash} à script-src`;
    }
    if (problem) problems.set(problem, (problems.get(problem) ?? 0) + 1);
  }
}

if (problems.size) {
  console.error('check-csp : la CSP de vercel.json bloquerait des scripts du site.');
  for (const [problem, count] of problems) console.error(`  - ${problem} (${count} page(s))`);
  process.exit(1);
}
console.log(`check-csp : ${pages.length} pages conformes à la CSP de vercel.json.`);
