import numpy as np, cv2
from scipy import ndimage
img = cv2.imread('orig.png')  # BGR
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)  # H 0-255, S 0-255, V 0-255
H = hsv[..., 0] * 360 / 255; S = hsv[..., 1] / 255; V = hsv[..., 2] / 255
# masque doux des verts/sarcelles sombres (sweat, fonds)
Hs = cv2.GaussianBlur(H, (0, 0), 2)
hw = np.clip(1 - np.maximum(0, np.abs(Hs - 165) - 45) / 25, 0, 1)
# dans le panneau « Poses utiles » (fonds verts flous), plage de teintes élargie pour éviter taches et halos
panel = np.zeros_like(H); panel[0:482, 745:] = 1
hw_wide = np.clip(np.minimum((Hs - 70) / 15, (230 - Hs) / 15), 0, 1)
hw = np.maximum(hw, hw_wide * panel)
Sb = cv2.GaussianBlur(S, (0, 0), 3)
sw = np.clip((Sb - 0.03) / 0.10, 0, 1)
vw = np.clip((0.62 - V) / 0.15, 0, 1)
m = hw * sw * vw
m = cv2.GaussianBlur(m, (0, 0), 2.5) * np.clip((0.68 - V) / 0.14, 0, 1)  # pas de débord sur les fonds clairs
# cible : bleu marine de la marque, ombrage conservé
Hn = np.full_like(H, 218.0)
Sn = np.clip(0.62 + Sb * 0.7, 0, 0.88)
Vn = np.clip(V * 1.32 + 0.015, 0, 1)
tgt = hsv.copy()
tgt[..., 0] = Hn * 255 / 360; tgt[..., 1] = Sn * 255; tgt[..., 2] = Vn * 255
tgt_bgr = cv2.cvtColor(np.clip(tgt, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR_FULL).astype(np.float32)
res = (img.astype(np.float32) * (1 - m[..., None]) + tgt_bgr * m[..., None]).clip(0, 255).astype(np.uint8)
cv2.imwrite('recolor.png', res)
np.save('mask.npy', m)
print('ok', m.mean())
