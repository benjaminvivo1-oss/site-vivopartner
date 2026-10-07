"""Place les blocs de la voix traitée sur la timeline vidéo (layout.json), écrit la piste (44,1 kHz),
puis assets/voice-env.js : enveloppe de la bouche, warp, moments calés sur les mots, plages de parole."""
import json, sys, numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly
L = json.load(open(sys.argv[1])); sr, x = wavfile.read(sys.argv[2]); x = x.astype(np.float32)
SR = 44100; x = resample_poly(x, 147, 160).astype(np.float32); sr = SR
dur = L['duration']; track = np.zeros(int((dur + 0.5) * SR), np.float32)
blocks = sorted(L['blocks'].values(), key=lambda b: b[1])
for i, (vf, a, b) in enumerate(blocks):
    pre = min(0.08, a - (blocks[i - 1][2] if i else 0) - 0.02); post = min(0.18, (blocks[i + 1][1] - b - 0.02) if i + 1 < len(blocks) else 0.4)
    s0, s1 = int((a - pre) * SR), int((b + post) * SR); seg = x[s0:s1].copy()
    fi, fo = int(0.02 * SR), int(0.07 * SR); seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo)
    d = int((vf - pre) * SR); track[d:d + len(seg)] += seg
    print('bloc %5.2f-%5.2f → %5.2f s' % (a, b, vf))
track = track[:int(dur * SR)]
wavfile.write(sys.argv[3], SR, track)
hop = SR // 60; n = len(track) // hop
rms = np.array([np.sqrt(np.mean(track[i*hop:(i+1)*hop] ** 2)) + 1e-9 for i in range(n)])
db = 20 * np.log10(rms); peak = np.percentile(db[db > -60], 95)
v = np.clip((db - (peak - 28)) / 24, 0, 1); out = np.zeros_like(v); acc = 0
for i, e in enumerate(v): acc = e if e > acc else acc * 0.72 + e * 0.28; out[i] = acc
js = ('window.VOICE_ENV=' + json.dumps([round(float(e), 3) for e in out]) + ';\nwindow.WARP=' + json.dumps(L['warp']) +
      ';\nwindow.VOICE_T=' + json.dumps(L['times']) + ';\nwindow.VOICE_TALK=' + json.dumps(L['talk']) + ';\n')
open(sys.argv[4], 'w').write(js)
