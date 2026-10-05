import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/video.html'); await p.evaluate(() => document.fonts.ready);
for (const t of process.argv.slice(2)) { await p.evaluate((t) => seek(+t), t); await p.screenshot({ path: `prev-${t}.jpg`, quality: 70 }); }
await b.close();
