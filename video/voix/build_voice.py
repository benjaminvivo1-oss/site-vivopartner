"""Place les phrases de la voix mascotte sur la timeline vidéo et exporte l'enveloppe pour la bouche."""
import json, subprocess, sys, numpy as np
from scipy.io import wavfile
SRC, OUT, ENV, TOTAL = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
SR = 44100
# (début source, fin source, début vidéo, tempo)
SEGS = [(0.00, 1.45, 0.40, 1.0),    # Vivo Partner, c'est quoi ?
        (1.80, 7.80, 13.85, 1.06),  # Trois leviers : … sur mesure.
        (8.08, 11.18, 19.62, 1.0),  # Et surtout : … la même pour tous.
        (11.50, 14.40, 28.76, 1.0), # On commence par comprendre … audit.
        (14.64, 17.18, 31.96, 1.0), # Puis on construit …
        (17.56, 20.69, 37.16, 1.0)] # Vivo Partner. Réservez votre diagnostic gratuit.
track = np.zeros(int(TOTAL * SR) + SR, np.float32)
for i, (a, b, d, tempo) in enumerate(SEGS):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', SRC, '-ac', '1', '-ar', str(SR)]
    af = 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse' + (f',atempo={tempo}' if tempo != 1 else '')
    raw = subprocess.run(cmd + ['-af', af, '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32); s = int(d * SR)
    track[s:s + len(x)] += x
    print(f'phrase {i+1}: {d:.2f} → {d + len(x)/SR:.2f} s')
track = track[:int(TOTAL * SR)]
wavfile.write(OUT, SR, track)
# enveloppe à 60 i/s (temps vidéo), en dB normalisés 0..1, attaque rapide / relâche douce
hop = SR // 60; n = len(track) // hop
rms = np.array([np.sqrt(np.mean(track[i*hop:(i+1)*hop] ** 2)) + 1e-9 for i in range(n)])
db = 20 * np.log10(rms); peak = np.percentile(db[db > -60], 95)
v = np.clip((db - (peak - 28)) / 24, 0, 1)
out = np.zeros_like(v); acc = 0
for i, x in enumerate(v): acc = x if x > acc else acc * 0.72 + x * 0.28; out[i] = acc
json.dump([round(float(x), 3) for x in out], open(ENV, 'w'))
