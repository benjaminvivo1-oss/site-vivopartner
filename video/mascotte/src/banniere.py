"""Ajoute la mascotte (bras croisés, logo net) sur la bannière 2000×500, devant la diagonale orange."""
import sys, os, numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from relogo import relogo
HERE = os.path.dirname(os.path.abspath(__file__))
banner = Image.open(sys.argv[2]).convert('RGBA'); BW, BH = banner.size
X2 = 2                                                   # mascotte préparée en 2× puis réduite : bords nets
m0 = Image.open(sys.argv[1]).convert('RGBA')
top_px, head_y = 8, float(sys.argv[5]) if len(sys.argv) > 5 else 34   # haut des cheveux dans la source / dans la bannière
k1 = (BH - head_y) / (m0.height - top_px)                # le bas du sweat touche le bas de la bannière
k = k1 * X2
m = m0.resize((round(m0.width * k), round(m0.height * k)), Image.LANCZOS)
m = relogo(m, k, os.path.join(HERE, 'vp-mark-navy.png'), os.path.join(HERE, 'vp-wordmark-navy.png'))
m.putalpha(m.split()[3].filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8)))
# ombre portée douce + léger halo orange derrière la tête
pad = 120; layer = Image.new('RGBA', (m.width + 2 * pad, m.height + 2 * pad), (0, 0, 0, 0))
sh = Image.new('RGBA', m.size, (2, 8, 25, 0)); sh.putalpha(m.split()[3].point(lambda p: int(p * 0.55)))
layer.alpha_composite(sh.filter(ImageFilter.GaussianBlur(28)), (pad + 14, pad + 22))
layer.alpha_composite(m, (pad, pad))
layer = layer.resize((round(layer.width / X2), round(layer.height / X2)), Image.LANCZOS)
glow = Image.new('RGBA', banner.size, (0, 0, 0, 0))
cx = float(sys.argv[4]); fx = 520                         # centre du visage dans la source (x)
left = round(cx - (fx * k1)) - pad // X2
g = Image.new('L', banner.size, 0)
from PIL import ImageDraw
ImageDraw.Draw(g).ellipse((cx - 230, 40, cx + 230, 500), fill=90)
glow.putalpha(g.filter(ImageFilter.GaussianBlur(70))); glow = Image.composite(Image.new('RGBA', banner.size, (245, 130, 32, 255)), glow, glow.split()[3]); glow.putalpha(g.filter(ImageFilter.GaussianBlur(70)))
out = banner.copy(); out.alpha_composite(glow)
out.alpha_composite(layer, (left, round(head_y - top_px * k1) - pad // X2))
out.convert('RGB').save(sys.argv[3], quality=95)
print('mascotte : x', left + pad // X2, '→', left + pad // X2 + round(m0.width * k1), ', échelle', round(k1, 3))
