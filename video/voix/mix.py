"""Musique + voix off : la musique baisse d'environ 14 dB quand la voix parle."""
import sys, numpy as np
from scipy.io import wavfile
from scipy.ndimage import maximum_filter1d, uniform_filter1d
sr, m = wavfile.read(sys.argv[1]); m = m.astype(np.float32) / 32768
sv, v = wavfile.read(sys.argv[2]); assert sr == sv
if m.ndim == 1: m = m[:, None].repeat(2, 1)
v = v.astype(np.float32); n = min(len(m), len(v)); m, v = m[:n], v[:n]
hop = sr // 100; act = np.array([np.sqrt(np.mean(v[i:i+hop] ** 2)) for i in range(0, n, hop)]) > 0.01
act = maximum_filter1d(act.astype(np.float32), 25)          # tient 250 ms entre les mots
g = 1 - 0.80 * uniform_filter1d(act, 15)                       # −14 dB sous la voix, transitions douces (~150 ms)
g = np.repeat(g, hop)[:n]
vn = v / (np.percentile(np.abs(v[v != 0]), 99.5) + 1e-9) * 0.55   # voix devant la musique
out = m * g[:, None] + vn[:, None] * 1.0
wavfile.write(sys.argv[3], sr, (np.clip(out, -1, 1) * 32767).astype(np.int16))
