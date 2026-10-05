import numpy as np, cv2
from PIL import Image
img = cv2.imread('recolor.png').astype(np.float32) / 255
navy = np.load('mask.npy') > 0.4
L = np.array(Image.open('chest_logo.png')).astype(np.float32) / 255
# centre x, centre y, largeur, angle (degrés, + = descend vers la droite), flou
logos = {
  'face': (115, 156, 24, 5, 0.5), '34': (266, 157, 21, 10, 0.5), 'pointe': (137, 745, 29, 22, 0.5), 'pouce': (302, 718, 28, 12, 0.5),
  'bras': (463, 708, 25, 8, 0.5), 'expl': (646, 712, 27, 8, 0.5), 'ordi': (830, 707, 25, 10, 0.5), 'tab': (1003, 696, 24, 12, 0.5),
  'det': (1177, 672, 27, -22, 0.5), 'contre': (297, 1060, 31, -22, 0.5), 'plong': (139, 1120, 44, 38, 0.6), 'close': (873, 1106, 48, 0, 0.6),
  'wall': (731, 944, 129, 0, 1.8), 'det1': (1083, 953, 81, 0, 0.7), 'det2': (1222, 948, 56, 8, 0.7)}
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
    if k not in ('wall', 'det1'): fab &= ~sky
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
# écran flou en arrière-plan
x0, y0, x1, y1 = 562, 1000, 625, 1040
crop = out[y0:y1, x0:x1].copy()
ring = np.ones(crop.shape[:2], np.float32); ring[3:-3, 3:-3] = 0
base = cv2.GaussianBlur(crop * ring[..., None], (0, 0), 14) / np.maximum(cv2.GaussianBlur(ring, (0, 0), 14)[..., None], 1e-4)
lw = 56; lh = int(L.shape[0] * lw / L.shape[1]); lg = cv2.resize(L, (lw, lh), interpolation=cv2.INTER_AREA)
cv_ = np.zeros((y1 - y0, x1 - x0, 4), np.float32); oy, ox = (y1 - y0 - lh) // 2, (x1 - x0 - lw) // 2; cv_[oy:oy + lh, ox:ox + lw] = lg
cv_ = cv2.GaussianBlur(cv_, (0, 0), 1.6); al = cv_[..., 3:4] * 0.8
patch = base * (1 - al) + np.clip(cv_[..., [2, 1, 0]] / np.maximum(cv_[..., 3:4], 1e-4), 0, 1) * 0.85 * al
fm = np.zeros(crop.shape[:2], np.float32); fm[2:-2, 2:-2] = 1; fm = cv2.GaussianBlur(fm, (0, 0), 2)[..., None]
out[y0:y1, x0:x1] = crop * (1 - fm) + patch * fm
# palette : le swatch beige devient orange
o8 = (np.clip(out, 0, 1) * 255).astype(np.uint8)
cy, cx, r = 1052, 1105, 24
yy, xx = np.mgrid[0:o8.shape[0], 0:o8.shape[1]]
circ = ((yy - cy) ** 2 + (xx - cx) ** 2) < r ** 2
hsv = cv2.cvtColor(o8, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
sel = circ & (hsv[..., 1] > 40) & (hsv[..., 2] > 60)
hsv[..., 0][sel] = 28 * 255 / 360; hsv[..., 1][sel] = np.clip(hsv[..., 1][sel] * 2.9, 0, 235); hsv[..., 2][sel] = np.clip(hsv[..., 2][sel] * 1.45, 0, 250)
o8 = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR_FULL)
cv2.imwrite('mascotte-vivopartner.png', o8)
print('ok')
