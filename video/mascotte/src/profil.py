"""Photos de profil 1080×1080 avec la mascotte (pose bras croisés), 3 fonds aux couleurs de Vivo Partner."""
import sys, os, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from relogo import relogo
from PIL import Image, ImageDraw, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]
S = 2160  # travail en 2× puis réduction, pour des bords nets
m = Image.open(SRC).convert('RGBA')
face = (417, 125, 206, 249)                      # boîte du visage dans l'image source
k = 0.30 * S / face[3]                           # hauteur du visage ≈ 30 % du cadre (tête entière dans le cercle)
fx, fy = face[0] + face[2] / 2, face[1] + face[3] / 2
m = m.resize((round(m.width * k), round(m.height * k)), Image.LANCZOS)
# logo du sweat remplacé par le vrai logo, net
HERE = os.path.dirname(os.path.abspath(__file__))
m = relogo(m, k, os.path.join(HERE, 'vp-mark-navy.png'), os.path.join(HERE, 'vp-wordmark-navy.png'))
# bord du détourage resserré d'un pixel : enlève le liseré sombre visible sur fond clair
m.putalpha(m.split()[3].filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)))
ox, oy = round(S / 2 - fx * k), round(S * 0.47 - fy * k)

def radial(c0, c1, c2, cy=0.42):
    y, x = np.mgrid[0:S, 0:S].astype(np.float32)
    r = np.sqrt((x - S / 2) ** 2 + (y - S * cy) ** 2) / (S * 0.75)
    c0, c1, c2 = [np.array(c, np.float32) for c in (c0, c1, c2)]
    t = np.clip(r, 0, 1)[..., None]
    col = np.where(t < 0.5, c0 + (c1 - c0) * (t / 0.5), c1 + (c2 - c1) * ((t - 0.5) / 0.5))
    return Image.fromarray(col.clip(0, 255).astype(np.uint8), 'RGB').convert('RGBA')

def glow(color, alpha, r, cy):
    g = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    d.ellipse((S / 2 - r, cy - r, S / 2 + r, cy + r), fill=color + (alpha,))
    return g.filter(ImageFilter.GaussianBlur(r * 0.45))

def ring(color, width, r, cy):
    g = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    d.ellipse((S / 2 - r, cy - r, S / 2 + r, cy + r), outline=color + (255,), width=width)
    return g

VARIANTES = {
    'navy':   dict(bg=((26, 78, 159), (11, 47, 107), (6, 27, 66)), glow=((245, 130, 32), 95), ring=(245, 130, 32), shadow=0.45),
    'orange': dict(bg=((255, 178, 102), (245, 130, 32), (214, 96, 14)), glow=((255, 236, 210), 120), ring=(255, 255, 255), shadow=0.30),
    'clair':  dict(bg=((255, 255, 255), (243, 245, 248), (226, 232, 240)), glow=((245, 130, 32), 70), ring=(245, 130, 32), shadow=0.22),
}
def crisp_mark(path, width, opacity=1.0):
    """Logo VP agrandi sans flou : chaque couleur (V bleu, P orange) est agrandie séparément puis ses bords resserrés."""
    import cv2
    src = np.array(Image.open(path).convert('RGBA')).astype(np.float32)
    ys, xs = np.where(src[..., 3] > 10); src = np.pad(src, ((4, 4), (4, 4), (0, 0)))[ys.min():ys.max() + 9, xs.min():xs.max() + 9]
    hsv = cv2.cvtColor(np.clip(src[..., :3], 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
    a = src[..., 3] / 255; orange = ((hsv[..., 0] < 25) & (hsv[..., 1] > 80)).astype(np.float32)
    f = width / src.shape[1]; size = (round(src.shape[1] * f), round(src.shape[0] * f))
    out = np.zeros((size[1], size[0], 4), np.float32)
    for mask, col in ((a * (1 - orange), (11, 47, 107)), (a * orange, (245, 130, 32))):
        up = cv2.resize(mask, size, interpolation=cv2.INTER_CUBIC)
        up = cv2.GaussianBlur(up, (0, 0), f * 0.35)
        up = np.clip((up - 0.5) * 4 + 0.5, 0, 1)                    # bords nets
        up = cv2.GaussianBlur(up, (0, 0), 0.7)                      # anticrénelage
        out[..., :3] += np.array(col, np.float32) * up[..., None]; out[..., 3] += up
    out[..., :3] /= np.maximum(out[..., 3:], 1e-4); out[..., 3] = np.clip(out[..., 3], 0, 1) * 255 * opacity
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), 'RGBA')

HERE = os.path.dirname(os.path.abspath(__file__))
VARIANTES['clair-logo'] = dict(bg=((255, 255, 255), (247, 248, 250), (232, 236, 242)), glow=None, ring=None, shadow=0.22, logo=1.0)
VARIANTES['clair-logo-discret'] = dict(bg=((255, 255, 255), (247, 248, 250), (232, 236, 242)), glow=None, ring=None, shadow=0.22, logo=0.16)
cy = S * 0.47; R = S * 0.355
for name, v in VARIANTES.items():
    im = radial(*v['bg'])
    if v.get('glow'): im.alpha_composite(glow(v['glow'][0], v['glow'][1], S * 0.30, cy))
    if v.get('ring'): im.alpha_composite(ring(v['ring'], int(S * 0.012), R, cy))
    if v.get('logo'):  # logo VP en grand derrière la mascotte
        lg = crisp_mark(os.path.join(HERE, 'vp-mark-navy.png'), round(S * 0.76), v['logo'])
        im.alpha_composite(lg, (round(S / 2 - lg.width / 2), round(S * 0.42 - lg.height / 2)))
    # ombre portée de la mascotte
    a = m.split()[3]; sh = Image.new('RGBA', m.size, (2, 10, 30, 0)); sh.putalpha(a.point(lambda p: int(p * v['shadow'])))
    sh = sh.filter(ImageFilter.GaussianBlur(S * 0.012))
    im.alpha_composite(sh, (ox + int(S * 0.008), oy + int(S * 0.018)))
    # la mascotte « sort » de l'anneau : le haut de l'anneau reste derrière la tête, le bas passe derrière le corps
    im.alpha_composite(m, (ox, oy))
    out = im.convert('RGB').resize((1080, 1080), Image.LANCZOS)
    out.save(f'{OUT}/photo-profil-{name}.png', optimize=True)
    out.save(f'{OUT}/photo-profil-{name}.jpg', quality=93)
    print(name, 'ok')
