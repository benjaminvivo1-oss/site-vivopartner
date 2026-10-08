"""Photos de profil Facebook / Instagram avec le logo VP seul (1080 × 1080).

Le logo est agrandi couleur par couleur (V, P) puis ses bords resserrés, pour rester net.
Il est centré et tient dans le cercle d'affichage avec une marge (Facebook et Instagram rognent en rond).
Usage : python3 profil-logo.py <dossier de sortie>
"""
import os, sys, numpy as np, cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = os.path.join(HERE, 'vp-mark-navy.png')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'profil')
S = 2160                                    # rendu en 2×, réduit à 1080 à la fin
NAVY, ORANGE, WHITE = (11, 47, 107), (245, 130, 32), (255, 255, 255)


def mark(width, v_color):
    src = np.array(Image.open(MARK).convert('RGBA')).astype(np.float32)
    ys, xs = np.where(src[..., 3] > 10)
    src = np.pad(src, ((4, 4), (4, 4), (0, 0)))[ys.min():ys.max() + 9, xs.min():xs.max() + 9]
    hsv = cv2.cvtColor(np.clip(src[..., :3], 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
    a = src[..., 3] / 255; orange = ((hsv[..., 0] < 25) & (hsv[..., 1] > 80)).astype(np.float32)
    f = width / src.shape[1]; size = (round(src.shape[1] * f), round(src.shape[0] * f))
    out = np.zeros((size[1], size[0], 4), np.float32)
    for m, col in ((a * (1 - orange), v_color), (a * orange, ORANGE)):
        up = cv2.resize(m, size, interpolation=cv2.INTER_CUBIC)
        up = cv2.GaussianBlur(up, (0, 0), f * 0.35)
        up = np.clip((up - 0.5) * 4 + 0.5, 0, 1)           # bords nets
        up = cv2.GaussianBlur(up, (0, 0), 1.0)             # anticrénelage
        out[..., :3] += np.array(col, np.float32) * up[..., None]; out[..., 3] += up
    out[..., :3] /= np.maximum(out[..., 3:], 1e-4); out[..., 3] = np.clip(out[..., 3], 0, 1) * 255
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')


def radial(c_in, c_out, cy=0.42):
    y, x = np.mgrid[0:S, 0:S] / S
    t = np.clip(np.hypot(x - 0.5, y - cy) / 0.72, 0, 1)[..., None] ** 1.3
    rgb = np.array(c_in, np.float32) * (1 - t) + np.array(c_out, np.float32) * t
    return Image.fromarray(rgb.astype(np.uint8), 'RGB').convert('RGBA')


VARIANTES = {
    'logo-navy':  dict(bg=((26, 72, 146), (8, 36, 86)),       v=WHITE),
    'logo-blanc': dict(bg=((255, 255, 255), (236, 240, 246)), v=NAVY),
}
os.makedirs(OUT, exist_ok=True)
for name, v in VARIANTES.items():
    im = radial(*v['bg'])
    lg = mark(round(S * 0.66), v['v'])
    a = np.array(lg)[..., 3]; ys, xs = np.where(a > 128)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2   # centre de la boîte du logo
    im.alpha_composite(lg, (round(S / 2 - cx), round(S / 2 - cy)))
    out = im.convert('RGB').resize((1080, 1080), Image.LANCZOS)
    out.save(f'{OUT}/photo-profil-{name}.png', optimize=True)
    print(name, 'ok')
