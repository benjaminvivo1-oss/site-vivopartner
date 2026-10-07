// Rend un texte avec une police donnée (fichier woff2), fond transparent, échelle 2×.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [, , out, html, css, font] = process.argv;
fs.writeFileSync('t2.html', `<html><head><meta charset="utf-8"><style>
@font-face{font-family:F;src:url(${font}) format('woff2')}
html,body{margin:0;background:transparent} #t{position:absolute;left:0;top:0;white-space:nowrap;color:#F2F8FD;font-family:F;${css}} .o{color:#E5802D}
</style></head><body><div id="t">${html}</div></body></html>`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 2600, height: 600 }, deviceScaleFactor: 2 });
await p.goto('file://' + process.cwd() + '/t2.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
await p.locator('#t').screenshot({ path: out, omitBackground: true }); await b.close();
