import base64, io, json, sys, numpy as np, cv2
from PIL import Image
A = sys.argv[1]; out = {}
for n in ['salue', 'explique', 'reflechit', 'pointe', 'chantier', 'bureau']:
    c = Image.open(f'{A}/masc_{n}.png').convert('RGBA')
    a = np.array(c)[..., 3].astype(np.float32) / 255
    # ombre portée : silhouette floutée (dans une marge pour ne pas la couper)
    pad = 60; ap = np.pad(a, pad); sh = cv2.GaussianBlur(ap, (0, 0), 16)
    shi = Image.fromarray((np.clip(sh, 0, 1) * 255).astype(np.uint8), 'L')
    def b64(im, fmt='PNG'):
        bio = io.BytesIO(); im.save(bio, fmt, optimize=True); return f'data:image/{fmt.lower()};base64,' + base64.b64encode(bio.getvalue()).decode()
    d = np.array(Image.open(f'{A}/depth_{n}.png').convert('L')).astype(np.float32) / 255
    # profondeur de déformation : lissée et compressée pour éviter les déchirures aux discontinuités
    dv = cv2.GaussianBlur(d, (0, 0), 0.014 * max(d.shape))
    dv = 0.45 + 0.42 * np.tanh((dv - 0.45) * 2.0)
    dvi = Image.fromarray((np.clip(dv, 0, 1) * 255).astype(np.uint8), 'L')
    out[n] = {'c': b64(c), 'd': b64(Image.open(f'{A}/depth_{n}.png').convert('L')), 'v': b64(dvi), 's': b64(shi), 'pad': pad, 'w': c.width, 'h': c.height}
open(f'{A}/masc3d.js', 'w').write('window.MASC3D=' + json.dumps(out) + ';')
