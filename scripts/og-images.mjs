/**
 * Génère les images de partage (Open Graph, 1200 × 630) de chaque page dans public/og/.
 *
 * Usage (outil de développement, à relancer si un titre change) :
 *   npm install --no-save playwright && npx playwright install chromium
 *   node scripts/og-images.mjs
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const b64 = (p) => readFileSync(root + p).toString('base64');

const pages = {
  home: {
    eyebrow: 'Vivo Partner · BTP · Carcassonne et à distance',
    title: 'Le partenaire digital des entreprises du <em>BTP.</em>',
  },
  aplomb: {
    eyebrow: 'Levier 01 — Aplomb',
    title: 'Votre entreprise a ses propres process. <em>Votre outil aussi.</em>',
  },
  ia: {
    eyebrow: 'Levier 02 — Réceptionniste IA',
    title: 'Chaque demande manquée est un devis qui <em>part chez le concurrent.</em>',
  },
  visibilite: { eyebrow: 'Levier 03 — Visibilité locale', title: 'Être trouvé, <em>avant d’être choisi.</em>' },
  apropos: {
    eyebrow: 'À propos — Carcassonne',
    title: 'Benjamin Vivo, une <em>spécialisation totale sur le BTP.</em>',
  },
  contact: { eyebrow: 'Contact', title: 'Parlons de <em>votre entreprise.</em>' },
  faq: { eyebrow: 'FAQ', title: 'Questions <em>fréquentes</em>' },
  legal: { eyebrow: 'Informations légales', title: 'Mentions légales' },
  rgpd: { eyebrow: 'RGPD', title: 'Politique de confidentialité' },
};

const css = `
@font-face{font-family:Satoshi;font-weight:500;src:url(data:font/woff2;base64,${b64('public/fonts/Satoshi-Medium.woff2')}) format('woff2')}
@font-face{font-family:Inter;font-weight:100 900;src:url(data:font/woff2;base64,${b64('public/fonts/Inter-latin.woff2')}) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:400 800;src:url(data:font/woff2;base64,${b64('public/fonts/JetBrainsMono-latin.woff2')}) format('woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0B2F6B;color:#F8FAFC;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(248,250,252,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(248,250,252,.045) 1px,transparent 1px);background-size:64px 64px}
.line{position:absolute;left:0;right:0;top:0;height:2px;background:#F58220;opacity:.45}
.bar{position:absolute;left:64px;top:0;width:96px;height:5px;background:#F58220}
.wrap{position:absolute;inset:0;padding:64px;display:flex;flex-direction:column}
.logo{height:46px;width:auto;align-self:flex-start}
.eyebrow{margin-top:auto;display:flex;align-items:center;gap:14px;font-family:'JetBrains Mono',monospace;font-size:19px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;color:#CBD5E1}
.eyebrow i{display:block;width:34px;height:3px;background:#F58220}
h1{margin-top:26px;max-width:18ch;font-family:Satoshi,Inter,sans-serif;font-weight:500;font-size:68px;line-height:1.04;letter-spacing:-.04em}
h1.long{font-size:58px;max-width:22ch}
h1 em{font-style:normal;color:#F58220}
.foot{margin-top:40px;padding-top:20px;border-top:1px solid rgba(248,250,252,.18);display:flex;justify-content:space-between;font-size:20px;font-weight:600}
.foot span:last-child{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:17px;letter-spacing:.1em;text-transform:uppercase;color:#CBD5E1}
.sticker{position:absolute;right:72px;top:150px;background:#F58220;color:#0F172A;border-radius:2px;padding:18px 24px;transform:rotate(6deg);box-shadow:0 14px 28px rgba(2,8,22,.35);font-family:Satoshi,Inter,sans-serif;font-weight:500;font-size:26px;line-height:1.2}
.sticker b{display:block;font-family:Inter,sans-serif;font-size:17px;font-weight:600}
`;

const html = ({
  eyebrow,
  title,
}) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="grid"></div><div class="line"></div><div class="bar"></div>
<div class="sticker">Audit 30 min<b>offert · sans engagement</b></div>
<div class="wrap">
  <img class="logo" src="data:image/png;base64,${b64('src/assets/brand/vp-lockup-light.png')}" alt="">
  <div class="eyebrow"><i></i>${eyebrow}</div>
  <h1 class="${title.replace(/<[^>]+>/g, '').length > 52 ? 'long' : ''}">${title}</h1>
  <div class="foot"><span>Aplomb · Réceptionniste IA · Visibilité locale</span><span>vivopartner.com</span></div>
</div></body></html>`;

let chromium;
try {
  ({ chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright'));
} catch {
  console.error('Playwright est nécessaire : npm install --no-save playwright && npx playwright install chromium');
  process.exit(1);
}

mkdirSync(root + 'public/og', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [key, data] of Object.entries(pages)) {
  await page.setContent(html(data), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${root}public/og/${key}.png` });
  console.log(`public/og/${key}.png`);
}
await browser.close();
