// Couverture Facebook 1640×624 (sans la mascotte) : fond quadrillé, logo, slogan, titre, contacts, réseaux.
// Rendu en 2× (3280×1248) ; la mascotte est ajoutée ensuite par banniere.py.
// Zone visible sur mobile : x ≈ 265 → 1375. Coin bas-gauche laissé libre (photo de profil).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [, , out = 'fond.png', guides = ''] = process.argv;
const ic = (d, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24">${d}</svg>`;
const PHONE = '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>';
const GLOBE = '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19"/>';
const MAIL = '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 6.5l9 6.5 9-6.5"/>';
const SOC = {
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M8 10.5V17M8 7.2v.1M11.5 17v-6.5M11.5 13.3a2.6 2.6 0 0 1 5.2 0V17"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.3 6.7v.1"/>',
  facebook: '<path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4a20 20 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.1H8.6v3h2.7V21"/>',
  tiktok: '<path d="M13.5 3.5v11.2a3.3 3.3 0 1 1-3.3-3.3"/><path d="M13.5 3.5c.4 2.4 2.2 4.3 4.8 4.6"/>',
};
const X0 = 300;                                  // marge gauche du texte (zone mobile + marge)
fs.writeFileSync('cover.html', `<html><head><meta charset="utf-8"><style>
@font-face{font-family:T;src:url(InterTight-800.woff2) format('woff2');font-weight:800}
@font-face{font-family:I;src:url(Inter-latin.woff2) format('woff2');font-weight:100 900}
@font-face{font-family:S;src:url(SourceSerif4-500.woff2) format('woff2');font-weight:500}
html,body{margin:0;width:1640px;height:624px;overflow:hidden}
body{position:relative;background:#0F3A80;
  background-image:
    radial-gradient(ellipse 900px 520px at 22% 18%, rgba(40,84,152,.75), rgba(40,84,152,0) 70%),
    radial-gradient(ellipse 800px 600px at 92% 95%, rgba(6,27,70,.7), rgba(6,27,70,0) 70%),
    linear-gradient(115deg,#173f80 0%,#0f357a 45%,#0b2f6b 100%)}
.grid{position:absolute;inset:0;background-image:
    linear-gradient(rgba(150,190,255,.07) 1px,transparent 1px),
    linear-gradient(90deg,rgba(150,190,255,.07) 1px,transparent 1px);
  background-size:27.75px 27.75px;background-position:-6px -4px;
  -webkit-mask-image:radial-gradient(ellipse 1100px 600px at 45% 45%,#000 30%,rgba(0,0,0,.45) 100%)}
.wm{position:absolute;left:-70px;top:70px;height:600px;opacity:.05}
.diag{position:absolute;width:5px;height:900px;background:linear-gradient(#F58220,rgba(245,130,32,.0));transform-origin:top left}
.diag.b{width:2px;opacity:.55}
.logo{position:absolute;left:${X0}px;top:44px;display:flex;align-items:flex-end;gap:16px}
.logo .m{height:46px} .logo .w{height:34px;margin-bottom:1px}
.slogan{position:absolute;left:${X0 + 2}px;top:104px;font-family:S;font-weight:500;font-size:25px;color:#F2F8FD;white-space:nowrap}
.o{color:#F58220}
.kick{position:absolute;left:${X0}px;top:174px;display:flex;align-items:center;gap:14px;font-family:I;font-weight:800;font-size:15px;letter-spacing:.24em;color:#F58220}
.kick i{display:block;width:38px;height:3px;border-radius:2px;background:#F58220}
h1{position:absolute;left:${X0 - 2}px;top:204px;margin:0;font-family:T;font-weight:800;font-size:47px;line-height:1.1;letter-spacing:-.02em;color:#fff;white-space:nowrap}
.row{position:absolute;left:${X0}px;display:flex;align-items:center;white-space:nowrap;font-family:I;font-weight:700;font-size:23px;color:#F3F7FC;letter-spacing:.01em}
.it{display:inline-flex;align-items:center;gap:10px} .it+.it{margin-left:34px}
svg{width:24px;height:24px;fill:none;stroke:#F58220;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.soc{display:inline-flex;align-items:center;gap:11px} .soc svg{width:25px;height:25px;stroke-width:2}
.soc span{margin-left:4px}
.guide{position:absolute;top:0;bottom:0;width:0;border-left:2px dashed #0f0}
.pp{position:absolute;left:24px;bottom:-110px;width:340px;height:340px;border-radius:50%;border:3px dashed #0f0}
</style></head><body>
<div class="grid"></div>
<img class="wm" src="vp-mark-light.png">
<div class="diag" style="left:1125px;top:-40px;transform:rotate(19deg)"></div>
<div class="diag b" style="left:1160px;top:-40px;transform:rotate(19deg)"></div>
<div class="logo"><img class="m" src="vp-mark-light.png"><img class="w" src="vp-wordmark-light.png"></div>
<div class="slogan">Automatise aujourd’hui. <span class="o">Accélère demain</span></div>
<div class="kick"><i></i>IA &amp; DIGITAL POUR LE BTP</div>
<h1>J’aide les entreprises du BTP<br>à décrocher <span class="o">plus de chantiers</span><br>et à <span class="o">gagner du temps.</span></h1>
<div class="row" style="top:398px"><span class="it">${ic(PHONE)}<span>06 40 20 22 46</span></span><span class="it">${ic(MAIL)}<span>benjamin@vivopartner.com</span></span></div>
<div class="row" style="top:446px"><span class="it">${ic(GLOBE)}<span>vivopartner.com</span></span><span class="it soc">${Object.values(SOC).map((d) => ic(d)).join('')}<span>@vivopartner</span></span></div>
${guides ? '<div class="guide" style="left:265px"></div><div class="guide" style="left:1375px"></div><div class="pp"></div>' : ''}
</body></html>`);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1640, height: 624 }, deviceScaleFactor: 2 });
await p.goto('file://' + process.cwd() + '/cover.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
const box = await p.evaluate(() => [...document.querySelectorAll('h1,.row,.slogan,.logo')].map((e) => { const r = e.getBoundingClientRect(); return [e.className || e.tagName, Math.round(r.left), Math.round(r.right), Math.round(r.top), Math.round(r.bottom)]; }));
console.log(JSON.stringify(box));
await p.screenshot({ path: out }); await b.close();
