"""Remplace le grand titre de la bannière : efface l'ancien (grille du fond reconstruite), écrit le nouveau en Inter Tight."""
import subprocess, sys, numpy as np, scipy.ndimage as nd
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
L1 = "J’aide les entreprises du BTP"
L2 = 'à décrocher <span class="o">plus de chantiers</span> et à <span class="o">gagner du temps.</span>'
X0, MAXW = 810, 1950 - 810
im = np.array(Image.open(SRC).convert('RGB')).astype(np.float32); H, W = im.shape[:2]
lum = im.mean(2)
# 1. masque de l'ancien titre (blanc + orange), un peu élargi
y0, y1, x0, x1 = 116, 264, 800, 1680
txt = np.zeros((H, W), bool)
reg = im[y0:y1, x0:x1]
txt[y0:y1, x0:x1] = (reg.mean(2) > 95) | ((reg[..., 0] > 140) & (reg[..., 0] - reg[..., 2] > 50))
mask = nd.binary_dilation(txt, iterations=4)
# 2. fond lisse (convolution normalisée sur les pixels hors texte)
hp = lum - nd.gaussian_filter(lum, 6)
keep = (~mask).astype(np.float32); sm = np.zeros_like(im)
for c in range(3):
    sm[..., c] = nd.gaussian_filter(im[..., c] * keep, 14) / np.maximum(nd.gaussian_filter(keep, 14), 1e-4)
# 3. grille : profils mesurés là où il n'y a pas de texte
gx = np.median(hp[260:284, :], axis=0)                 # lignes verticales (entre le titre et les pastilles)
gy = np.median(hp[:, 1700:1980], axis=1)               # lignes horizontales (à droite du titre)
gx = gx - np.median(gx); gy = gy - np.median(gy)
fill = sm + (gx[None, :] + gy[:, None])[..., None] * np.array([0.85, 0.95, 1.15])
soft = nd.gaussian_filter(mask.astype(np.float32), 1.2)[..., None]
out = im * (1 - soft) + fill * soft
# 4. nouveau titre : taille calculée pour que la 2e ligne tienne dans la largeur
def render(path, html, fs):
    subprocess.run(['node', 'text2.mjs', path, html, f'font-size:{fs}px;letter-spacing:-0.02em;line-height:1;font-weight:800', 'InterTight-800.woff2'], check=True, capture_output=True)
    t = Image.open(path); a = np.array(t)[..., 3]; ys, xs = np.where(a > 8)
    return t, xs.min(), xs.max(), ys.min(), ys.max()
fs = 72.0
t, a0, a1, b0, b1 = render('l2.png', L2, fs); fs = fs * min(1.0, MAXW / ((a1 - a0 + 1) / 2))
print('taille du titre : %.1f px' % fs)
res = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA')
lh = fs * 1.08; top = 128
for i, html in enumerate((L1, L2)):
    t, a0, a1, b0, b1 = render(f'l{i+1}.png', html, fs)
    t = t.resize((t.width // 2, t.height // 2), Image.LANCZOS)
    # aligne la gauche de l'encre sur X0 et la ligne de base de la 1re ligne comme l'original
    res.alpha_composite(t, (round(X0 - a0 / 2), round(top + i * lh)))
res.convert('RGB').save(OUT, quality=95)
