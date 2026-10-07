// Ligne de contact : icône téléphone + numéro, icône e-mail + adresse (fond transparent, échelle 2×).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [, , out, fsz, phone, mail, color = '#F3F7FC', gapK = '1.6'] = process.argv;
const f = +fsz;
const ic = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
const PHONE = '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>';
const MAIL = '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 6.5l9 6.5 9-6.5"/>';
fs.writeFileSync('contacts.html', `<html><head><meta charset="utf-8"><style>
@font-face{font-family:I;src:url(Inter-latin.woff2) format('woff2');font-weight:100 900}
html,body{margin:0;background:transparent}
#t{position:absolute;left:0;top:0;display:inline-flex;align-items:center;white-space:nowrap;font-family:I;font-weight:700;font-size:${f}px;color:${color};letter-spacing:0.01em}
.it{display:inline-flex;align-items:center;gap:${f * 0.45}px} .it+.it{margin-left:${f * +gapK}px}
svg{width:${f * 1.05}px;height:${f * 1.05}px;fill:none;stroke:#F58220;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
</style></head><body><div id="t"><span class="it">${ic(PHONE)}<span>${phone}</span></span><span class="it">${ic(MAIL)}<span>${mail}</span></span></div></body></html>`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 300 }, deviceScaleFactor: 2 });
await p.goto('file://' + process.cwd() + '/contacts.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
await p.locator('#t').screenshot({ path: out, omitBackground: true }); await b.close();
