import sys, numpy as np, cv2
from PIL import Image
src, out, PAD = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = np.array(Image.open(src).convert('RGBA')).astype(np.float32)
H, W = im.shape[:2]
a0 = im[0, :, 3] > 128; xs = np.where(a0)[0]; x0, x1 = xs.min(), xs.max()
cx, hw = (x0 + x1) / 2, (x1 - x0) / 2 + 6
new = np.zeros((H + PAD, W, 4), np.float32); new[PAD:] = im
# rangées miroir : la chevelure se prolonge vers le haut
SK = 7  # les premières rangées de la coupe ont une frange bleutée : on les remplace aussi
for k in range(PAD + SK):
    new[PAD + SK - 1 - k, :, :3] = im[min(H - 1, SK + k), :, :3]
# masque en dôme (ellipse) au-dessus de la coupe, bord doux, petites ondulations de boucles
yy, xx = np.mgrid[0:PAD, 0:W].astype(np.float32)
u = (xx - cx) / hw
dome_h = np.clip(1 - u ** 2, 0, 1) ** 0.8 * (PAD - 4)
dome_h *= 1 + 0.12 * np.sin(xx / 7.0 + 1.0) * np.clip(1 - u ** 2, 0, 1)
height_above = PAD - yy                      # distance au-dessus de la coupe
m = np.clip((dome_h - height_above) / 3.0 + 0.5, 0, 1)
m *= (new[PAD:PAD + 1, :, 3] / 255.0).repeat(PAD, 0) > 0.5
m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.0)
top = new[:PAD].copy()
# léger assombrissement vers le haut (ombre des boucles)
shade = 1 - 0.18 * (height_above / PAD)
top[..., :3] *= shade[..., None]
top[..., 3] = m * 255
new[:PAD] = top
Image.fromarray(np.clip(new, 0, 255).astype(np.uint8)).save(out)
print('coupe', x0, x1, '->', new.shape)
