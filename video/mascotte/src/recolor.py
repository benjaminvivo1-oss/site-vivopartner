import numpy as np, cv2
from scipy import ndimage
img = cv2.imread('orig.png')  # BGR
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV_FULL).astype(np.float32)  # H 0-255, S 0-255, V 0-255
H = hsv[..., 0] * 360 / 255; S = hsv[..., 1] / 255; V = hsv[..., 2] / 255
# masque doux des verts/sarcelles sombres (sweat, fonds)
hw = np.clip(1 - np.maximum(0, np.abs(H - 160) - 35) / 15, 0, 1)
sw = np.clip((S - 0.08) / 0.06, 0, 1)
vw = np.clip((0.62 - V) / 0.12, 0, 1)
m = hw * sw * vw
m = cv2.GaussianBlur(m, (0, 0), 1.2)
# cible : bleu marine de la marque, ombrage conservé
Hn = np.full_like(H, 218.0)
Sn = np.clip(0.62 + S * 0.7, 0, 0.88)
Vn = np.clip(V * 1.32 + 0.015, 0, 1)
out = hsv.copy()
out[..., 0] = (Hn * m + H * (1 - m)) * 255 / 360
out[..., 1] = (Sn * m + S * (1 - m)) * 255
out[..., 2] = (Vn * m + V * (1 - m)) * 255
res = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR_FULL)
cv2.imwrite('recolor.png', res)
np.save('mask.npy', m)
print('ok', m.mean())
