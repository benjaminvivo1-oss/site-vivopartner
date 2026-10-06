import onnxruntime as ort, numpy as np, cv2, glob, os, sys
from PIL import Image
sess = ort.InferenceSession(sys.argv[1], providers=['CPUExecutionProvider'])
inp = sess.get_inputs()[0]; print(inp.name, inp.shape)
for f in sorted(glob.glob(sys.argv[2] + '/masc_*.png')):
    im = np.array(Image.open(f).convert('RGBA')).astype(np.float32) / 255
    a = im[..., 3:4]; rgb = im[..., :3] * a + 0.5 * (1 - a)
    H, W = a.shape[:2]
    x = cv2.resize(rgb, (518, 518), interpolation=cv2.INTER_CUBIC)
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    d = sess.run(None, {inp.name: x})[0].squeeze()
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    m = a[..., 0] > 0.5
    lo, hi = np.percentile(d[m], 2), np.percentile(d[m], 99.5)
    d = np.clip((d - lo) / (hi - lo), 0, 1)
    # bords : on étend la profondeur hors silhouette pour éviter les arrachements
    dm = np.where(m, d, 0).astype(np.float32); w = m.astype(np.float32)
    k = 41; num = cv2.GaussianBlur(dm, (k, k), 0); den = cv2.GaussianBlur(w, (k, k), 0) + 1e-6
    d = np.where(m, d, num / den)
    d = cv2.GaussianBlur(d.astype(np.float32), (0, 0), 1.5)
    out = os.path.join(sys.argv[3], os.path.basename(f).replace('masc_', 'depth_'))
    Image.fromarray((np.clip(d, 0, 1) * 255).astype(np.uint8)).save(out)
    print(out, d.shape)
