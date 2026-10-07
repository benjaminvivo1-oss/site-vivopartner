// Rend « icône téléphone + numéro » sur fond transparent, échelle 2×.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [, , out, fs_, txt] = process.argv;
fs.writeFileSync('tel.html', `<html><head><meta charset="utf-8"><style>
@font-face{font-family:I;src:url(Inter-latin.woff2) format('woff2');font-weight:100 900}
html,body{margin:0;background:transparent}
#t{position:absolute;left:0;top:0;display:inline-flex;align-items:center;gap:${fs_ * 0.45}px;white-space:nowrap;font-family:I;font-weight:700;font-size:${fs_}px;color:#F3F7FC;letter-spacing:0.01em}
#t svg{width:${fs_ * 1.05}px;height:${fs_ * 1.05}px;fill:none;stroke:#F58220;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
</style></head><body><div id="t"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span>${txt}</span></div></body></html>`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 300 }, deviceScaleFactor: 2 });
await p.goto('file://' + process.cwd() + '/tel.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
await p.locator('#t').screenshot({ path: out, omitBackground: true }); await b.close();
