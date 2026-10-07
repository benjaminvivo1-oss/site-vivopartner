// Icônes des réseaux (LinkedIn, Instagram, Facebook, TikTok) + identifiant, fond transparent, échelle 2×.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [, , out, fsz, handle, color = '#F3F7FC', icon = '#F58220'] = process.argv;
const f = +fsz;
export const ICONS = {
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M8 10.5V17M8 7.2v.1M11.5 17v-6.5M11.5 13.3a2.6 2.6 0 0 1 5.2 0V17"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.3 6.7v.1"/>',
  facebook: '<path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4a20 20 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.1H8.6v3h2.7V21"/>',
  tiktok: '<path d="M13.5 3.5v11.2a3.3 3.3 0 1 1-3.3-3.3"/><path d="M13.5 3.5c.4 2.4 2.2 4.3 4.8 4.6"/>',
};
const ic = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
fs.writeFileSync('socials.html', `<html><head><meta charset="utf-8"><style>
@font-face{font-family:I;src:url(Inter-latin.woff2) format('woff2');font-weight:100 900}
html,body{margin:0;background:transparent}
#t{position:absolute;left:0;top:0;display:inline-flex;align-items:center;gap:${f * 0.5}px;white-space:nowrap;font-family:I;font-weight:700;font-size:${f}px;color:${color};letter-spacing:0.01em}
svg{width:${f * 1.1}px;height:${f * 1.1}px;fill:none;stroke:${icon};stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
span{margin-left:${f * 0.15}px}
</style></head><body><div id="t">${Object.values(ICONS).map(ic).join('')}<span>${handle}</span></div></body></html>`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 300 }, deviceScaleFactor: 2 });
await p.goto('file://' + process.cwd() + '/socials.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
await p.locator('#t').screenshot({ path: out, omitBackground: true }); await b.close();
