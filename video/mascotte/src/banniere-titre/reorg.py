"""Bannière : efface la ligne du bas (slogan + site), met le slogan sous le logo (2 lignes, pixels d'origine)
et ajoute la ligne de contact téléphone · e-mail · site."""
import sys, numpy as np, scipy.ndimage as nd
from PIL import Image
BASE, ORIG, CONTACT, OUT = sys.argv[1:5]
im = np.array(Image.open(BASE).convert('RGB')).astype(np.float32); H, W = im.shape[:2]
lum = im.mean(2); hp = lum - nd.gaussian_filter(lum, 6)

def background(img, mask, gx_rows, gy_cols):
    """Fond reconstruit dans le masque : fond lisse + lignes de grille aux mêmes positions."""
    keep = (~mask).astype(np.float32); sm = np.zeros_like(img)
    for c in range(3): sm[..., c] = nd.gaussian_filter(img[..., c] * keep, 14) / np.maximum(nd.gaussian_filter(keep, 14), 1e-4)
    L = img.mean(2); h = L - nd.gaussian_filter(L, 6)
    gx = np.median(h[gx_rows[0]:gx_rows[1], :], 0); gy = np.median(h[:, gy_cols[0]:gy_cols[1]], 1)
    gx -= np.median(gx); gy -= np.median(gy)
    return sm + (gx[None, :] + gy[:, None])[..., None] * np.array([0.85, 0.95, 1.15])

# 1. ligne du bas : masque du slogan + point + site
y0, y1, x0, x1 = 418, 468, 1205, 1925
reg = im[y0:y1, x0:x1]
txt = np.zeros((H, W), bool); txt[y0:y1, x0:x1] = (reg.mean(2) > 95) | ((reg[..., 0] > 130) & (reg[..., 0] - reg[..., 2] > 45))
mask = nd.binary_dilation(txt, iterations=4)
bg = background(im, mask, (470, 496), (1000, 1190))
# matting du slogan d'origine (pour le déplacer tel quel)
sx0, sx1 = 1215, 1680
patch = im[y0:y1, sx0:sx1]; pbg = bg[y0:y1, sx0:sx1]
orange = (patch[..., 0] - patch[..., 2]) > 45
fg = np.where(orange[..., None], np.array([229, 128, 45], np.float32), np.array([242, 248, 253], np.float32))
d = fg - pbg; alpha = np.clip(((patch - pbg) * d).sum(2) / np.maximum((d * d).sum(2), 1), 0, 1)
alpha[alpha < 0.06] = 0
# effacement
soft = nd.gaussian_filter(mask.astype(np.float32), 1.2)[..., None]
im = im * (1 - soft) + bg * soft
# 2. slogan découpé en deux mots-groupes (colonne vide la plus large au milieu)
cols = alpha.max(0) > 0.1; xs = np.where(cols)[0]
gaps = []; prev = xs[0]
for x in xs[1:]:
    if x - prev > 6: gaps.append((x - prev, prev, x))
    prev = x
split = max([g for g in gaps if 150 < g[1] < 330], key=lambda g: g[0])
parts = [(xs[0], split[1] + 1), (split[2], xs[-1] + 1)]
rows = np.where(alpha.max(1) > 0.1)[0]; ry0, ry1 = rows[0], rows[-1] + 1
LX, LY, LH = 84, 136, 34            # sous le logo : x aligné sur le V, 2 lignes
for i, (a, b) in enumerate(parts):
    al = alpha[ry0:ry1, a:b]; f = fg[ry0:ry1, a:b]
    ty, tx = LY + i * LH, LX
    h_, w_ = al.shape
    dst = im[ty:ty + h_, tx:tx + w_]
    im[ty:ty + h_, tx:tx + w_] = dst * (1 - al[..., None]) + f * al[..., None]
    print('slogan partie', i + 1, 'largeur', w_, '→ x', tx, '-', tx + w_, 'y', ty, '-', ty + h_)
# 3. ligne de contact (téléphone · e-mail · site)
res = Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).convert('RGBA')
t = Image.open(CONTACT); t = t.resize((t.width // 2, t.height // 2), Image.LANCZOS)
a = np.array(t)[..., 3] > 60; ys, xs2 = np.where(a); cy = (ys.min() + ys.max()) / 2
res.alpha_composite(t, (round(812 - xs2.min()), round(398 - cy)))
print('contacts : x 812 →', 812 + xs2.max() - xs2.min())
res.convert('RGB').save(OUT, quality=95)
