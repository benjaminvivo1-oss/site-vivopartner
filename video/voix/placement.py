"""Voix off de Benjamin : un bloc continu par scène, déformation du temps de l'animation (warp)
et moments de l'animation calés sur les mots. Écrit layout.json (lu par build_track et music.py)."""
import json, sys
import numpy as np
K = 1.25
RMAX = 1.5  # là où la voix laisse de la place, l'animation peut aller jusqu'à 20 % plus vite qu'avant
# (scène, début et fin du bloc dans l'enregistrement, temps d'animation du 1er mot, fin de scène (anim), marge après la voix)
SCENES = [
 ('s1',  0.22,  1.96,  0.50,  2.90, 0.15),
 ('s2',  2.33,  8.10,  4.55, 10.60, 0.85),
 ('s3',  8.15, 14.10, 10.95, 17.60, 0.30),
 ('s4', 14.29, 21.25, 17.95, 24.15, 0.25),
 ('s8', 21.57, 24.23, 24.55, 28.35, 0.30),
 ('sad', 24.42, 29.04, 29.10, 35.55, 0.45),
 ('s9a', 29.58, 33.05, 36.00, 39.50, 0.05),
 ('s9b', 33.08, 35.66, 40.00, 43.20, 0.30),
 ('s10', 35.85, 39.52, 43.50, 45.75, 0.25),
 ('s11', 40.01, 42.92, 46.45, 50.75, 1.80),
]
GAP_MIN = 0.28
warp = [[0.0, 0.0]]; place = {}; prev = None
for name, a, b, first, out, tail in SCENES:
    if prev is None: vf = first / K
    else:
        pv_out, pT_out, pv_end = prev
        vf = max(pv_out + (first - pT_out) / K, pv_end + GAP_MIN)
    ve = vf + (b - a)
    vo = max(vf + (out - first) / RMAX, ve + tail)
    warp += [[round(vf, 3), first], [round(vo, 3), out]]
    place[name] = (vf, a, b); prev = (vo, out, ve)
DUR = warp[-1][0]
def V(rec):  # temps vidéo d'un instant de l'enregistrement
    best = min(place.values(), key=lambda p: 0 if p[1] <= rec <= p[2] else min(abs(rec - p[1]), abs(rec - p[2])))
    return best[0] + rec - best[1]
S = lambda v: float(np.interp(v, [w[0] for w in warp], [w[1] for w in warp]))
A = lambda rec: round(S(V(rec)), 3)
T = {  # moments de l'animation calés sur des mots de l'enregistrement
 'hero': A(6.01), 'name': A(6.99),
 's3l1': A(9.34), 's3l2': A(10.71), 's3l3': A(12.16), 's3l4': A(13.39),
 's4a': A(14.29), 's4b': A(16.03), 's4c': A(17.16), 's4d': A(19.01), 's4ds': A(19.84),
 's8a': A(21.57), 's8b': A(22.20), 's8c': A(22.84), 'flip': A(23.57),
 's8ba': A(24.42), 's8bb': A(25.93), 's8bc': A(28.10),
 's9a': A(29.58), 's9b': A(30.72), 's9c': A(33.08), 's9d': A(33.85),
 's10a': A(35.85), 's10b': A(36.86), 's10c': A(38.18),
 's11mark': A(40.01), 'cta': A(41.16),
}
talk = {}
for who, a, b in [('salue', 0.22, 1.96), ('chantier', 6.01, 8.10), ('explique', 14.29, 21.25), ('bras', 21.57, 24.23), ('bureau', 29.58, 35.66), ('pointe', 40.01, 42.92)]:
    talk.setdefault(who, []).append([round(A(a) - 0.05, 3), round(A(b) + 0.08, 3)])
print('durée vidéo %.2f s' % DUR)
for (v0, s0), (v1, s1) in zip(warp[:-1], warp[1:]):
    print('  vidéo %6.2f→%6.2f | anim %6.2f→%6.2f | vitesse ×%.2f' % (v0, v1, s0, s1, (s1 - s0) / max(v1 - v0, 1e-6)))
print(json.dumps(T)); print(json.dumps(talk))
json.dump({'warp': warp, 'times': T, 'talk': talk, 'blocks': {k: [round(v[0], 3), v[1], v[2]] for k, v in place.items()}, 'duration': round(DUR, 3)}, open(sys.argv[1], 'w'), indent=1)
