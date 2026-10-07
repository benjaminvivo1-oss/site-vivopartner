"""Photos de profil 1080×1080 avec la mascotte (pose bras croisés), 3 fonds aux couleurs de Vivo Partner."""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]
S = 2160  # travail en 2× puis réduction, pour des bords nets
m = Image.open(SRC).convert('RGBA')
face = (417, 125, 206, 249)                      # boîte du visage dans l'image source
k = 0.30 * S / face[3]                           # hauteur du visage ≈ 30 % du cadre (tête entière dans le cercle)
fx, fy = face[0] + face[2] / 2, face[1] + face[3] / 2
m = m.resize((round(m.width * k), round(m.height * k)), Image.LANCZOS)
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
cy = S * 0.47; R = S * 0.355
for name, v in VARIANTES.items():
    im = radial(*v['bg'])
    im.alpha_composite(glow(v['glow'][0], v['glow'][1], S * 0.30, cy))
    im.alpha_composite(ring(v['ring'], int(S * 0.012), R, cy))
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
