// node render.mjs <fps> <start> <end> <outdir>   |   node render.mjs shots t1,t2,... outdir
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const url = 'file://' + process.cwd() + '/index.html';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()));
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const [, , mode, a, b, c, d] = process.argv;
if (mode === 'cues') { fs.writeFileSync(a, JSON.stringify(await page.evaluate(() => window.CUES))); }
else if (mode === 'shots') {
  const ts = a.split(',').map(Number); fs.mkdirSync(b, { recursive: true });
  for (const t of ts) { await page.evaluate((t) => window.seek(t), t); await page.screenshot({ path: `${b}/t${t.toFixed(2).padStart(6, "0")}.jpg`, type: 'jpeg', quality: 80 }); }
} else {
  const fps = +mode, s = +a, e = +b, out = c; fs.mkdirSync(out, { recursive: true });
  for (let f = s; f < e; f++) {
    await page.evaluate((t) => window.seek(t), f / fps);
    await page.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
  }
}
await browser.close();
