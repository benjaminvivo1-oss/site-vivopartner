"""Bande-son « premium » : électro cinématique, propre (aucune saturation), 120 BPM.
Progression en do majeur : C – G – Am – F (une mesure = 2 s). Bruitages calés sur cues.json."""
import json
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, stft, istft
from scipy.io import wavfile

SR = 44100
DUR = 60.0
BEAT = 0.5
BAR = 2.0
N = int(SR * DUR)
rng = np.random.default_rng(5)

# Bus : dry (batterie), wet (envoyé en réverb), dly (délai ping-pong + réverb)
bus = {k: np.zeros((2, N)) for k in ('dry', 'verb', 'dly', 'sub')}


def T(d):
    return np.arange(int(d * SR)) / SR


def put(name, sig, t, g=1.0, pan=0.0):
    i = int(round(t * SR))
    if i >= N or len(sig) == 0:
        return
    if i < 0:
        sig = sig[-i:]; i = 0
    sig = sig[: N - i] * g
    a = (pan + 1) * np.pi / 4
    bus[name][0, i:i + len(sig)] += sig * np.cos(a) * 1.4142
    bus[name][1, i:i + len(sig)] += sig * np.sin(a) * 1.4142


def filt(x, kind, f, order=2):
    if kind == 'band':
        sos = butter(order, f, 'band', fs=SR, output='sos')
    else:
        sos = butter(order, f, kind, fs=SR, output='sos')
    return sosfilt(sos, x, axis=-1)


def noise(d):
    return rng.standard_normal(int(d * SR))


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def adsr(d, a=0.005, r=0.05, tau=None):
    t = T(d)
    e = np.minimum(1, t / max(a, 1e-4))
    if tau:
        e = e * np.exp(-np.maximum(0, t - a) / tau)
    e *= np.clip((d - t) / max(r, 1e-4), 0, 1)
    return e


def sine_sweep(f0, f1, d, curve='exp'):
    t = T(d)
    f = f0 * (f1 / f0) ** (t / d) if curve == 'exp' else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def shaped_noise(d, f0, f1, width=0.5, n=1024):
    """Bruit filtré dont la bande passe de f0 à f1 (sans clics : traitement STFT)."""
    x = noise(d + 0.1)
    f, tt, Z = stft(x, SR, nperseg=n)
    prog = np.clip(tt / d, 0, 1)
    fc = f0 * (f1 / f0) ** prog
    lf = np.log2(np.maximum(f, 20))[:, None]
    mask = np.exp(-((lf - np.log2(fc)[None, :]) ** 2) / (2 * width ** 2))
    _, y = istft(Z * mask, SR, nperseg=n)
    y = y[: int(d * SR)]
    return y / (np.max(np.abs(y)) + 1e-9)


# ---------------------------------------------------------------- instruments
def kick(v=1.0):
    d = 0.42; t = T(d)
    f = 46 + 95 * np.exp(-t / 0.04)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.17)
    c = filt(noise(0.006), 'low', 4000) * 0.15
    s[: len(c)] += c
    return s * adsr(d, 0.001, 0.02) * v


def clap(v=1.0):
    d = 0.35; s = np.zeros(int(d * SR))
    for k, o in enumerate((0, 0.009, 0.018, 0.027)):
        b = filt(noise(0.02), 'band', [1100, 4200]) * (1 - k * 0.15)
        i = int(o * SR); s[i:i + len(b)] += b * np.exp(-T(0.02) / 0.006)
    s += filt(noise(d), 'band', [1000, 3800]) * np.exp(-T(d) / 0.07) * 0.6
    return s * v * 0.6


def hat(v=1.0, op=False):
    d = 0.22 if op else 0.05
    s = filt(filt(noise(d), 'high', 7500, 4), 'low', 13000)
    return s * np.exp(-T(d) / (0.06 if op else 0.012)) * v


def shaker(v=1.0):
    d = 0.09; t = T(d)
    s = filt(noise(d), 'band', [4500, 11000])
    return s * np.sin(np.pi * t / d) ** 2 * np.exp(-t / 0.04) * v


def sub(m, d, v=1.0):
    t = T(d); f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    return s * adsr(d, 0.01, 0.08) * v


def bass8(m, d, v=1.0):
    t = T(d); f = hz(m)
    ph = (f * t) % 1
    s = filt(2 * ph - 1, 'low', 700) + 0.6 * np.sin(2 * np.pi * f * t)
    return s * adsr(d, 0.004, 0.04, tau=d * 0.6) * v


def fm_pluck(m, d=0.6, v=1.0, idx=2.2, ratio=2.0, tau=0.22):
    t = T(d); f = hz(m)
    I = idx * np.exp(-t / 0.08)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * ratio * t))
    return s * adsr(d, 0.002, 0.05, tau=tau) * v


def ep(m, d=1.8, v=1.0):  # piano électrique (FM ratio 1)
    t = T(d); f = hz(m)
    I = 1.4 * np.exp(-t / 0.4)
    s = np.sin(2 * np.pi * f * t + I * np.sin(2 * np.pi * f * t))
    s += 0.2 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.05)
    return s * adsr(d, 0.003, 0.3, tau=0.9) * v


def pad(notes, d, v=1.0, cut=1400):
    t = T(d); s = np.zeros(len(t))
    for m in notes:
        f = hz(m)
        for dt in (-0.004, 0.0035, 0.0):
            ph = (f * (1 + dt) * t + rng.random()) % 1
            s += (2 * ph - 1) / 3
    s = filt(s, 'low', cut) / len(notes)
    return s * adsr(d, 0.6, 0.6) * v


def bell(m, d=1.2, v=1.0):
    t = T(d); f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.5) + 0.35 * np.sin(2 * np.pi * f * 2.4 * t) * np.exp(-t / 0.15)
    return s * adsr(d, 0.002, 0.1) * v


def boom(v=1.0, d=2.2):
    t = T(d)
    s = sine_sweep(70, 32, d) * np.exp(-t / 0.7)
    s += filt(noise(d), 'low', 500) * np.exp(-t / 0.12) * 0.5
    return s * adsr(d, 0.002, 0.2) * v


def whoosh(d=0.6, f0=300, f1=5000, v=1.0):
    t = T(d)
    return shaped_noise(d, f0, f1, 0.55) * np.sin(np.pi * t / d) ** 1.5 * v


def riser(d, v=1.0):
    t = T(d); p = t / d
    s = shaped_noise(d, 400, 9000, 0.6) * p ** 2.2
    s += sine_sweep(220, 880, d) * p ** 3 * 0.18
    return s * v


def glass(v=1.0, f=2200):
    d = 0.12; t = T(d)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t / 0.015)
    return s * v


# ---------------------------------------------------------------- arrangement
PROG = [  # (accord, basse)
    ([60, 64, 67, 71], 36),  # Cmaj7
    ([59, 62, 67, 74], 43),  # G
    ([57, 60, 64, 67], 45),  # Am7
    ([57, 60, 65, 69], 41),  # Fmaj7
]
ARP = [0, 2, 1, 3, 2, 1, 3, 1]


def section(t):
    for a, b, name in [(0, 3.6, 'intro'), (3.6, 10, 'verse'), (10, 18, 'verse2'), (18, 24, 'build'),
                       (24, 42.6, 'chorus'), (42.6, 46, 'break'), (46, 54, 'verse2'), (54, 56, 'chorus'), (56, 60, 'outro')]:
        if a <= t < b:
            return name
    return 'outro'


kick_times = []
for s in range(int(DUR / 0.125)):
    t = s * 0.125
    sec = section(t)
    q = s % 4; beat = (s // 4) % 4
    if q == 0:
        if sec in ('verse', 'verse2', 'chorus') or (sec == 'build' and t < 23.5) or (sec == 'break' and t >= 44.7 and beat in (0,)):
            put('dry', kick(), t, 0.75); kick_times.append(t)
        if sec == 'outro' and t < 58.6 and beat in (0, 2):
            put('dry', kick(), t, 0.6); kick_times.append(t)
    if sec in ('verse2', 'chorus') and q == 0 and beat in (1, 3):
        put('dry', clap(), t, 0.8, 0.05); put('verb', clap(), t, 0.35)
    if sec in ('verse', 'verse2') and q == 2:
        put('dry', shaker(), t, 0.22, 0.25)
    if sec == 'verse2' and q in (1, 3):
        put('dry', shaker(), t, 0.1, -0.25)
    if sec == 'chorus':
        if q == 2: put('dry', hat(op=True), t, 0.16, 0.3)
        else: put('dry', hat(), t, 0.07 + 0.04 * (q == 0), -0.25)
    if sec == 'build' and t < 23.5:
        put('dry', shaker(), t, 0.08 + 0.2 * (t - 18) / 5.5, 0.2 if q % 2 else -0.2)

# ducking
duck = np.ones(N)
for kt in kick_times:
    i = int(kt * SR); d = int(0.25 * SR); j = min(N, i + d)
    e = 1 - 0.6 * np.exp(-np.arange(j - i) / (0.06 * SR))
    duck[i:j] = np.minimum(duck[i:j], e)

for bar in range(int(DUR / BAR)):
    t0 = bar * BAR
    sec = section(t0 + 0.01)
    chord, root = PROG[bar % 4]
    if t0 >= 56:
        break
    # nappe
    cut = {'intro': 800, 'verse': 1100, 'verse2': 1500, 'build': 1800, 'chorus': 2400, 'break': 1000}.get(sec, 1200)
    g = {'intro': 0.5, 'break': 0.55}.get(sec, 0.38)
    put('verb', pad(chord, BAR + 0.6, 1, cut), t0, g * 0.9)
    put('dry', pad(chord, BAR + 0.6, 1, cut), t0, g * 0.8)
    # sub
    if sec in ('verse', 'verse2', 'chorus', 'build'):
        put('sub', sub(root - 12 if root > 40 else root, BAR - 0.05), t0, 0.55)
    if sec == 'chorus':
        for k in range(8):
            if k % 2:
                put('sub', bass8(root, 0.22), t0 + k * 0.25, 0.32)
    # arpège FM (délai ping-pong)
    if sec in ('verse', 'verse2', 'chorus', 'build'):
        step = 0.25
        for k in range(8):
            if sec == 'verse' and k % 2: continue
            m = chord[ARP[k] % len(chord)] + 12
            gg = 0.3 if sec == 'chorus' else 0.22
            put('dly', fm_pluck(m, 0.5, idx=2.6 if sec == 'chorus' else 1.8), t0 + k * step, gg, -0.3 if k % 2 else 0.3)
    # piano électrique dans le pont
    if sec == 'break':
        for m in chord:
            put('verb', ep(m - 12, 2.2), t0, 0.16)
            put('dry', ep(m - 12, 2.2), t0, 0.12)
    if sec == 'intro':
        put('verb', bell(chord[3] + 12, 2.0), t0 + 0.5, 0.06)

# accord final
fin = [48, 55, 60, 64, 67, 71]
put('verb', pad(fin[2:], 4.4, 1, 2200), 56.4, 0.5)
put('dry', pad(fin[2:], 4.4, 1, 2200), 56.4, 0.35)
for k, m in enumerate(fin[2:]):
    put('verb', ep(m, 3.8), 56.4 + k * 0.04, 0.12)
put('sub', sub(24 + 12, 3.8), 56.4, 0.6)
for k, m in enumerate([72, 76, 79, 83, 84]):
    put('dly', fm_pluck(m + 12, 0.8, idx=1.5), 58.1 + k * 0.125, 0.07, -0.5 + k * 0.25)

# ---------------------------------------------------------------- bruitages
for c in [dict(c, t=c['t'] * 1.25, v=c['v'] * 1.25 if c['type'] in ('count', 'tick', 'type') else c['v']) for c in json.load(open('cues.json'))] + [{'type': 'hit', 't': x, 'v': 0.8} for x in (3.6, 24.0, 42.6, 56.4)]:
    t, v, ty = c['t'], c['v'], c['type']
    p = float(rng.uniform(-0.3, 0.3))
    if ty == 'hit':
        put('sub', boom(1, 2.4), t, 0.5 * v)
        put('verb', filt(noise(0.3), 'low', 2500) * np.exp(-T(0.3) / 0.05), t, 0.25 * v)
    elif ty == 'final':
        put('sub', boom(1, 3.0), t, 0.7)
        put('verb', shaped_noise(2.5, 9000, 2000, 0.5) * np.exp(-T(2.5) / 0.8), t, 0.12)
    elif ty == 'drop':
        put('verb', riser(0.9, 1)[::-1], t - 0.9, 0.25)
        put('sub', boom(1, 2.6), t + 0.05, 0.7)
    elif ty == 'whoosh':
        put('verb', whoosh(0.55, 250, 6000), t - 0.15, 0.22 * v, p)
        put('dry', whoosh(0.55, 250, 6000), t - 0.15, 0.18 * v, p)
    elif ty == 'reveal':
        put('verb', whoosh(0.5, 2500, 9000), t, 0.06 * v, p)
    elif ty == 'riser':
        put('verb', riser(v), t, 0.22); put('dry', riser(v), t, 0.12)
    elif ty == 'line':
        put('verb', sine_sweep(300, 1200, 1.3) * adsr(1.3, 0.4, 0.4), t, 0.05)
        put('verb', shaped_noise(1.3, 1500, 7000, 0.4) * adsr(1.3, 0.5, 0.5), t, 0.08)
    elif ty in ('swell', 'scan'):
        put('verb', shaped_noise(v, 600, 5000, 0.5) * adsr(v, v * 0.6, v * 0.4), t, 0.12)
    elif ty == 'draw':
        put('verb', shaped_noise(v, 3000, 7000, 0.35) * adsr(v, 0.3, 0.6), t, 0.06)
    elif ty == 'card':
        put('verb', whoosh(0.35, 900, 5000), t - 0.05, 0.09 * v, p)
        put('dry', whoosh(0.35, 900, 5000), t - 0.05, 0.08 * v, p)
    elif ty == 'toggle':
        put('dry', glass(1, 1900), t, 0.16 * v, p); put('dry', glass(1, 2600), t + 0.05, 0.1 * v, p)
    elif ty == 'stamp':
        put('dry', sine_sweep(160, 55, 0.35) * np.exp(-T(0.35) / 0.09), t, 0.55 * v)
        put('verb', filt(noise(0.2), 'low', 1800) * np.exp(-T(0.2) / 0.04), t, 0.3 * v)
    elif ty == 'count':
        k = 0
        while k * 0.07 < v:
            put('dry', glass(1, 2000 + k * 60) * 0.5, t + k * 0.07, 0.08, (-0.2, 0.2)[k % 2]); k += 1
    elif ty == 'type':
        k = 0
        while k * 0.065 < v:
            put('dry', filt(noise(0.02), 'band', [2000, 7000]) * np.exp(-T(0.02) / 0.004), t + k * 0.065 + rng.uniform(0, 0.015), 0.22, p); k += 1
    elif ty == 'pop':
        put('verb', glass(1, 1600), t, 0.18 * v, p); put('dry', glass(1, 1600), t, 0.18 * v, p)
    elif ty == 'tick1':
        put('dry', glass(1, 2600), t, 0.14 * v, p); put('verb', glass(1, 2600), t, 0.1 * v, p)
    elif ty == 'tick':
        k = 0
        while k * 0.125 < v:
            put('dry', glass(1, 3200) * 0.6, t + k * 0.125, 0.1, (-0.2, 0.2)[k % 2]); k += 1
    elif ty == 'rise':
        put('verb', sine_sweep(400, 900, 0.7) * adsr(0.7, 0.05, 0.3, tau=0.3), t, 0.06, p)
    elif ty == 'block':
        put('dry', sine_sweep(140, 70, 0.25) * np.exp(-T(0.25) / 0.06), t, 0.3 * v, p)
    elif ty == 'notif':
        put('verb', bell(84, 1.0), t, 0.1); put('verb', bell(91, 1.2), t + 0.12, 0.1)
    elif ty in ('sparkle', 'shimmer'):
        for k, m in enumerate([84, 88, 91, 95, 96]):
            put('verb', bell(m, 1.0), t + k * 0.07, 0.05 * v / 0.7, -0.4 + k * 0.2)

# ---------------------------------------------------------------- effets & mix
def ir(d, tau, pre=0.02, lp=6000):
    n = int(d * SR); t = np.arange(n) / SR
    out = []
    for _ in range(2):
        x = rng.standard_normal(n) * np.exp(-t / tau)
        x[: int(pre * SR)] = 0
        x = filt(x, 'low', lp)
        out.append(x / np.sqrt(np.sum(x ** 2)))
    return out

irL, irR = ir(2.6, 0.7)
dly = bus['dly']
# ping-pong 3/8 de temps
D = int(0.375 * SR); fb = 0.38
pp = np.zeros_like(dly)
src = dly.mean(0)
l = np.zeros(N); r = np.zeros(N)
for k in range(1, 6):
    g = fb ** k
    sh = np.zeros(N); sh[k * D:] = src[: N - k * D] * g
    if k % 2: r += sh
    else: l += sh
dly_out = dly + filt(np.stack([l, r]), 'low', 5000)

wet_in = bus['verb'] + 0.5 * dly_out + 0.08 * bus['dry']
wet = np.stack([fftconvolve(wet_in[0], irL)[:N], fftconvolve(wet_in[1], irR)[:N]])
music = bus['dry'] + 0.35 * bus['verb'] + dly_out * 0.8 + wet * 0.55
music[:, :] *= np.where(np.arange(N) < 0, 1, 1)
# la nappe/arp/réverb respirent avec le kick ; sub aussi
music = bus['dry'] * 0 + music  # (garde le dry de la batterie intact)
tonal = music - bus['dry']
mix = bus['dry'] + tonal * duck + filt(bus['sub'], 'low', 180) * duck * 0.3

mix = filt(mix, 'high', 28)
# fondu de fin
tt = np.arange(N) / SR
mix *= np.clip((DUR - tt) / 1.6, 0, 1)
# limiteur doux (lookahead simple) puis normalisation
peak = np.max(np.abs(mix))
mix = mix / peak
env = np.maximum.reduce([np.abs(mix[0]), np.abs(mix[1])])
win = int(0.005 * SR)
from scipy.ndimage import maximum_filter1d, uniform_filter1d
env = uniform_filter1d(maximum_filter1d(env, win * 2), win)
thr = 0.5
gain = np.where(env > thr, thr / env, 1.0) ** 0.75
mix = mix * gain
pts = [(0, .8), (3.6, .62), (9.9, .62), (10.1, .75), (18, .78), (23.9, .95), (24, 1.0), (42.5, 1.0), (42.7, .75), (46, .78), (46.1, .82), (53.9, .85), (54, 1.0), (60, 1.0)]
mix = mix * np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])
mix = mix / np.max(np.abs(mix)) * 0.95
wavfile.write('music.wav', SR, (mix.T * 32767).astype(np.int16))
print('ok')
