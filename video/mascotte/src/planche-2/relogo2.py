import numpy as np, cv2
from PIL import Image
img = cv2.imread('recolor.png').astype(np.float32) / 255
navy = np.load('mask.npy') > 0.4
L = np.array(Image.open('chest_logo.png')).astype(np.float32) / 255
# centre x, centre y, largeur, angle (degrés, + = descend vers la droite), flou
logos = {
  'face': (108, 145, 24, 6, 0.5), '34': (251, 148, 22, 6, 0.5), 'salue': (914, 201, 31, 14, 0.5), 'pointe': (1098, 196, 27, 12, 0.5),
  'pouce': (1289, 189, 26, 10, 0.5), 'expl': (1449, 189, 31, 8, 0.5), 'refl': (892, 429, 36, 6, 0.5), 'tab': (1126, 413, 28, 6, 0.5),
  'bras': (1416, 408, 33, 6, 0.5), 'wall': (771, 811, 100, 0, 1.4), 'bchest': (895, 917, 32, 4, 0.5),
  'cchest': (1151, 922, 43, 2, 0.5), 'det': (1400, 802, 108, 0, 0.5)}
out = img.copy()
fabric_all = cv2.dilate(navy.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
for k, (cx, cy, w, ang, blur) in logos.items():
    pad = int(w * 0.9) + 12
    x0, y0, x1, y1 = cx - pad, cy - pad, cx + pad, cy + pad
    crop = out[y0:y1, x0:x1].copy(); fab0 = fabric_all[y0:y1, x0:x1]
    kz = max(5, int(w * 0.55)) | 1
    fab = cv2.morphologyEx(fab0.astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kz, kz))) > 0
    hsv_ = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV_FULL)
    sky = (hsv_[..., 1] > 0.22) & (hsv_[..., 2] > 0.5) & (hsv_[..., 0] > 180) & (hsv_[..., 0] < 240)  # ciel, écran bleu…
    skin = (hsv_[..., 0] < 45) & (hsv_[..., 1] > 0.3) & (hsv_[..., 2] > 0.35)
    pass  # pas de ciel au contact des logos sur cette planche
    if k not in ('wall', 'det1'): fab &= ~skin
    hh, ww = crop.shape[:2]
    # zone à effacer : rectangle incliné autour de l'ancien logo, uniquement sur le tissu
    rect = ((pad, pad), (w * 1.22 + 4, w * 0.62 + 4), ang)
    box = cv2.boxPoints(rect).astype(np.int32)
    hole = np.zeros((hh, ww), np.uint8); cv2.fillPoly(hole, [box], 1)
    hole = hole.astype(bool) & fab
    valid = (fab0 & ~hole).astype(np.float32)
    valid *= (cv2.cvtColor(crop, cv2.COLOR_BGR2HSV_FULL)[..., 2] < 0.55).astype(np.float32)
    fill = np.zeros_like(crop); den = np.zeros((hh, ww, 1), np.float32)
    for sg in (3, 6, 12, 24):
        n_ = cv2.GaussianBlur(crop * valid[..., None], (0, 0), sg); d_ = cv2.GaussianBlur(valid, (0, 0), sg)[..., None]
        f_ = n_ / np.maximum(d_, 1e-4)
        use = (den < 0.08) & (d_ > 0.02)
        fill = np.where(use, f_, fill); den = np.maximum(den, d_)
    hm = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 0.9)[..., None] * fab[..., None]
    clean = crop * (1 - hm) + fill * hm
    # nouveau logo
    sc = (w * 1.08) / L.shape[1]
    lw, lh = max(2, int(round(L.shape[1] * sc))), max(2, int(round(L.shape[0] * sc)))
    lg = cv2.resize(L, (lw * 4, lh * 4), interpolation=cv2.INTER_AREA)
    lg = cv2.resize(lg, (lw, lh), interpolation=cv2.INTER_AREA)
    M = cv2.getRotationMatrix2D((lw / 2, lh / 2), -ang, 1.0); M[0, 2] += pad - lw / 2; M[1, 2] += pad - lh / 2
    wp = cv2.warpAffine(lg, M, (ww, hh), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    if blur: wp = cv2.GaussianBlur(wp, (0, 0), blur)
    a = np.clip(wp[..., 3], 0, 1) * 0.95 * cv2.GaussianBlur(fab.astype(np.float32), (0, 0), 0.6)
    rgb = np.clip(wp[..., [2, 1, 0]] / np.maximum(wp[..., 3:4], 1e-4), 0, 1)
    lum = cv2.GaussianBlur(cv2.cvtColor(fill, cv2.COLOR_BGR2GRAY), (0, 0), 5)
    shade = np.clip(0.80 + lum * 1.5, 0.72, 1.0)[..., None]
    out[y0:y1, x0:x1] = clean * (1 - a[..., None]) + rgb * shade * a[..., None]
# casque de chantier et capot de l'ordinateur : logo hors tissu
def plain(cx, cy, w, h, ang, logo_png, alpha_max, tint=None):
    pad = int(max(w, h)) + 10
    x0, y0, x1, y1 = cx - pad, cy - pad, cx + pad, cy + pad
    crop = out[y0:y1, x0:x1].copy(); hh, ww = crop.shape[:2]
    hole = np.zeros((hh, ww), np.uint8)
    cv2.fillPoly(hole, [cv2.boxPoints(((pad, pad), (w + 6, h + 6), ang)).astype(np.int32)], 1)
    valid = (1 - hole).astype(np.float32)
    fill = np.zeros_like(crop); den = np.zeros((hh, ww, 1), np.float32)
    for sg in (2, 4, 8, 16):
        n_ = cv2.GaussianBlur(crop * valid[..., None], (0, 0), sg); d_ = cv2.GaussianBlur(valid, (0, 0), sg)[..., None]
        use = (den < 0.08) & (d_ > 0.02); fill = np.where(use, n_ / np.maximum(d_, 1e-4), fill); den = np.maximum(den, d_)
    hm = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 1.0)[..., None]
    clean = crop * (1 - hm) + fill * hm
    Lm = np.array(Image.open(logo_png).convert('RGBA')).astype(np.float32) / 255
    sc = w / Lm.shape[1]; lw, lh = max(2, int(Lm.shape[1] * sc)), max(2, int(Lm.shape[0] * sc))
    lg = cv2.resize(Lm, (lw, lh), interpolation=cv2.INTER_AREA)
    M = cv2.getRotationMatrix2D((lw / 2, lh / 2), -ang, 1.0); M[0, 2] += pad - lw / 2; M[1, 2] += pad - lh / 2
    wp = cv2.GaussianBlur(cv2.warpAffine(lg, M, (ww, hh), borderValue=(0, 0, 0, 0)), (0, 0), 0.5)
    a = wp[..., 3:4] * alpha_max
    rgb = np.clip(wp[..., [2, 1, 0]] / np.maximum(wp[..., 3:4], 1e-4), 0, 1) if tint is None else fill * tint
    out[y0:y1, x0:x1] = clean * (1 - a) + rgb * a
plain(1134, 776, 22, 15, -4, 'vp-mark-navy.png', 0.95)
plain(937, 956, 22, 16, 0, 'vp-mark-navy.png', 0.55, tint=1.35)
plain(125, 925, 32, 17, 18, 'chest_logo.png', 0.7)
# palette : le swatch beige devient orange
o8 = (np.clip(out, 0, 1) * 255).astype(np.uint8)
cy, cx, r = 868, 1360, 21
yy, xx = np.mgrid[0:o8.shape[0], 0:o8.shape[1]]
circ = ((yy - cy) ** 2 + (xx - cx) ** 2) < r ** 2
hsv = cv2.cvtColor(o8, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
sel = circ & (hsv[..., 1] > 40) & (hsv[..., 2] > 60)
hsv[..., 0][sel] = 28 * 255 / 360; hsv[..., 1][sel] = np.clip(hsv[..., 1][sel] * 2.9, 0, 235); hsv[..., 2][sel] = np.clip(hsv[..., 2][sel] * 1.45, 0, 250)
o8 = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR_FULL)
cv2.imwrite('mascotte-vivopartner-2.png', o8)
print('ok')
