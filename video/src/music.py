"""Bande-son synthétisée, calée sur les animations (120 BPM, la mineur : Am F C G)."""
import json
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 44100
DUR = 48.0
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
N = int(SR * DUR)
rng = np.random.default_rng(3)

L = np.zeros(N)
R = np.zeros(N)


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    sig = sig[: N - i]
    l = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    r = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    L[i : i + len(sig)] += sig * l
    R[i : i + len(sig)] += sig * r


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, f1, f2, order=2):
    return sosfilt(butter(order, [f1, f2], 'band', fs=SR, output='sos'), x)


def noise(d):
    return rng.standard_normal(int(d * SR))


def env_exp(d, tau):
    t = t_arr(d)
    return np.exp(-t / tau)


def note_hz(n):  # n = numéro MIDI
    return 440 * 2 ** ((n - 69) / 12)


def saw(f, d, detune=0.0):
    t = t_arr(d)
    ph = (f * (1 + detune) * t) % 1.0
    return 2 * ph - 1


# ---------------------------------------------------------------- instruments
def kick(v=1.0):
    d = 0.45
    t = t_arr(d)
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.16)
    s += np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03) * 0.5
    click = hp(noise(0.01), 2000) * 0.25
    s[: len(click)] += click
    return np.tanh(s * 1.6) * v


def clap(v=1.0):
    d = 0.3
    s = bp(noise(d), 900, 5000) * env_exp(d, 0.06)
    for k, o in enumerate([0.0, 0.011, 0.022]):
        i = int(o * SR)
        s[i : i + 300] += bp(noise(300 / SR), 900, 5000) * (0.8 - 0.2 * k)
    body = np.sin(2 * np.pi * 190 * t_arr(d)) * env_exp(d, 0.03) * 0.4
    return (s * 0.6 + body) * v


def hat(v=1.0, open_=False):
    d = 0.25 if open_ else 0.06
    s = lp(hp(noise(d), 6000, 4), 12000, 2) * env_exp(d, 0.08 if open_ else 0.015)
    return s * v


def bass_note(n, d, v=1.0):
    f = note_hz(n)
    t = t_arr(d)
    s = saw(f, d) + 0.5 * np.sin(2 * np.pi * f / 2 * t)
    s = lp(s, 1100, 2)
    a = np.minimum(1, t / 0.005) * np.exp(-t / (d * 0.9))
    return np.tanh(s * a * 1.5) * v


def pad_chord(notes, d, v=1.0, cutoff=1600):
    t = t_arr(d)
    s = np.zeros(len(t))
    for n in notes:
        f = note_hz(n)
        for dt in (-0.006, 0.0, 0.007):
            s += saw(f, d, dt) * 0.33
    s = lp(s, cutoff, 2)
    a = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.3)
    return s * a * v / len(notes)


def pluck(n, d=0.25, v=1.0):
    f = note_hz(n)
    t = t_arr(d)
    s = saw(f, d) * 0.6 + np.sign(np.sin(2 * np.pi * f * t)) * 0.4
    s = lp(s, 3500, 2)
    return s * np.exp(-t / 0.07) * v


def boom(v=1.0):
    d = 1.8
    t = t_arr(d)
    f = 32 + 90 * np.exp(-t / 0.08)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55)
    nz = lp(noise(d), 1800, 2) * np.exp(-t / 0.18) * 0.6
    return np.tanh((s + nz) * 1.4) * v


def whoosh(d=0.35, f0=400, f1=4000, v=1.0):
    n = noise(d)
    t = t_arr(d)
    out = np.zeros(len(n))
    seg = 512
    for i in range(0, len(n), seg):
        x = i / len(n)
        fc = f0 * (f1 / f0) ** x
        out[i : i + seg] = bp(n[max(0, i - 2048) : i + seg], fc * 0.6, min(fc * 1.6, 18000))[-len(n[i : i + seg]) :]
    a = np.sin(np.pi * t / d) ** 2
    return out * a * v


def blip(f0=700, f1=1400, d=0.09, v=1.0):
    t = t_arr(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03) * v


def bell(n, d=0.6, v=1.0):
    f = note_hz(n)
    t = t_arr(d)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.08)
    return s * np.exp(-t / 0.25) * v


def tick(v=1.0):
    d = 0.03
    return hp(noise(d), 3000) * env_exp(d, 0.004) * v + blip(2400, 2200, d, 0.4 * v)


def thud(v=1.0):
    d = 0.25
    t = t_arr(d)
    f = 70 + 120 * np.exp(-t / 0.02)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07)
    s += lp(noise(d), 900) * np.exp(-t / 0.03) * 0.5
    return s * v


def riser(d, v=1.0):
    t = t_arr(d)
    s = whoosh(d, 300, 9000, 1.0) * (t / d) ** 2 * 2
    f = 200 * (8 ** (t / d))
    s += np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 3 * 0.25
    return s * v


# ---------------------------------------------------------------- sections
# Accords par mesure (2 s) : Am F C G
PROG = [
    ([57, 60, 64], 45),  # Am, basse A2
    ([53, 57, 60], 41),  # F
    ([55, 60, 64], 48),  # C
    ([55, 59, 62], 43),  # G
]


def section(t):
    if t < 3: return 'intro'
    if t < 8: return 'build1'
    if t < 14: return 'build2'
    if t < 16: return 'break'
    if t < 31: return 'drop'
    if t < 33: return 'roll'
    if t < 35: return 'down'
    if t < 37: return 'half'
    if t < 42: return 'drop'
    return 'outro'


duck = np.ones(N)


def add_duck(t, depth=0.75, rel=0.22):
    i = int(t * SR)
    d = int(rel * SR)
    if i >= N: return
    e = 1 - depth * np.exp(-np.arange(d) / (rel * SR / 4))
    j = min(N, i + d)
    duck[i:j] = np.minimum(duck[i:j], e[: j - i])


mus_L = np.zeros(N)
mus_R = np.zeros(N)


def addm(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i]
    l = gain * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    r = gain * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    mus_L[i : i + len(sig)] += sig * l
    mus_R[i : i + len(sig)] += sig * r


K = kick()
steps = int(DUR / (BEAT / 4))
for s in range(steps):
    t = s * BEAT / 4
    sec = section(t)
    beat_pos = s % 4  # 16e dans le temps
    beat = (s // 4) % 4
    on_beat = beat_pos == 0
    # kick
    kick_on = False
    if sec in ('build1', 'build2', 'drop', 'roll') and on_beat: kick_on = True
    if sec == 'half' and on_beat and beat in (0, 2): kick_on = True
    if sec == 'break' and t < 14.6 and on_beat: kick_on = False
    if sec == 'outro' and t < 46 and on_beat and beat in (0, 2): kick_on = True
    if kick_on:
        add(K, t, 0.6)
        add_duck(t)
    # clap
    if sec in ('build2', 'drop', 'half') and on_beat and beat in (1, 3):
        add(clap(), t, 0.5, 0.05)
    # hats
    if sec in ('build1', 'build2') and beat_pos == 2:
        add(hat(), t, 0.22, 0.3)
    if sec in ('drop', 'roll'):
        if beat_pos == 2: add(hat(open_=True), t, 0.16, 0.3)
        else: add(hat(), t, 0.13 if beat_pos else 0.07, -0.3)
    if sec == 'half' and beat_pos == 2:
        add(hat(), t, 0.2, 0.3)

# Basse, accords, arpège par croche
for s in range(int(DUR / (BEAT / 2))):
    t = s * BEAT / 2
    sec = section(t)
    bar = int(t // BAR)
    chord, root = PROG[bar % 4]
    eighth = s % 2
    if sec in ('build2', 'drop', 'roll', 'half') and eighth == 1:
        addm(bass_note(root, BEAT / 2 * 0.9), t, 0.5)
    if sec in ('drop',) and eighth == 0 and (s // 2) % 4 == 0:
        addm(bass_note(root - 12, BEAT * 0.9, 0.8), t, 0.45)
    if sec == 'drop':
        arp = chord + [chord[0] + 12]
        n = arp[s % 4] + 12
        addm(pluck(n, 0.22), t, 0.26, 0.4 if s % 2 else -0.4)
    if sec == 'build2' and s % 2 == 0:
        addm(pluck(chord[(s // 2) % 3] + 12, 0.2), t, 0.18, 0.25)

# Nappe
for bar in range(int(DUR / BAR)):
    t = bar * BAR
    sec = section(t + 0.01)
    chord, root = PROG[bar % 4]
    cut = {'intro': 700, 'build1': 1000, 'build2': 1400, 'break': 900, 'drop': 2200, 'roll': 1800, 'down': 800, 'half': 1600, 'outro': 1500}[sec]
    g = {'intro': 0.35, 'down': 0.4, 'outro': 0.45}.get(sec, 0.28)
    if t >= 42: break
    addm(pad_chord(chord, BAR + 0.3, 1.0, cut * 1.6), t, g * 2.2)
# accord final tenu
addm(pad_chord([57, 60, 64, 69], 6.0, 1.0, 1800), 42.0, 0.6)
addm(bass_note(33, 3.5, 0.9), 42.0, 0.5)

# Ducking (sidechain) sur la musique tonale
mus_L *= duck
mus_R *= duck
L += mus_L
R += mus_R

# ---------------------------------------------------------------- bruitages
cues = json.load(open('cues.json'))
fx_L = np.zeros(N)
fx_R = np.zeros(N)
for c in cues:
    t, v, ty = c['t'], c['v'], c['type']
    p = float(rng.uniform(-0.35, 0.35))
    if ty == 'impact':
        add(boom(), t, 0.38 * v)
        add(hp(noise(0.08), 1500) * env_exp(0.08, 0.02), t, 0.25 * v, p)
    elif ty == 'pop':
        add(blip(600, 1500, 0.09), t, 0.3 * v, p)
    elif ty == 'whoosh':
        add(whoosh(0.32, 500, 6000), t - 0.06, 0.45 * v, p)
    elif ty == 'swish':
        add(whoosh(0.2, 1500, 9000), t, 0.3 * v, p)
    elif ty == 'brick':
        add(thud(), t, 0.5 * v, p)
    elif ty == 'thud':
        add(thud(), t, 0.6 * v, p)
    elif ty == 'tick1':
        add(tick(), t, 0.5 * v, p)
    elif ty == 'tick':
        for k in range(int(v / (BEAT / 4))):
            add(tick(), t + k * BEAT / 4, 0.28, (-0.3, 0.3)[k % 2])
    elif ty == 'type':
        for k in range(16):
            add(tick(), t + k * 0.05 + rng.uniform(0, 0.012), 0.22, p)
    elif ty == 'sparkle':
        for k, n in enumerate([81, 84, 88, 93, 96]):
            add(bell(n, 0.5), t + k * 0.09, 0.12, -0.4 + k * 0.2)
    elif ty == 'notif':
        add(bell(88, 0.5), t, 0.25)
        add(bell(93, 0.7), t + 0.12, 0.25)
    elif ty == 'slash':
        add(whoosh(0.18, 8000, 600), t, 0.55, p)
        add(boom(), t + 0.14, 0.4)
    elif ty == 'snareroll':
        k, tt = 0, t
        while tt < t + v:
            prog = (tt - t) / v
            add(clap(), tt, 0.12 + 0.3 * prog, 0.1)
            tt += BEAT / (2 if prog < 0.5 else 4 if prog < 0.8 else 8)
        add(riser(v), t, 0.35)
    elif ty == 'riser':
        d = v if v >= 1 else 1.0
        add(riser(d), t, 0.4)

# ---------------------------------------------------------------- réverb + master
ir_d = 1.6
ir = rng.standard_normal(int(ir_d * SR)) * np.exp(-t_arr(ir_d) / 0.4)
ir = lp(ir, 5000)
ir /= np.sqrt(np.sum(ir ** 2))
wetL = fftconvolve(L, ir)[:N]
wetR = fftconvolve(R, np.roll(ir, 1200))[:N]
L = L + 0.18 * wetL
R = R + 0.18 * wetR

# fondu final
t_all = np.arange(N) / SR
fade = np.clip((DUR - t_all) / 2.0, 0, 1)
fade_in = np.clip(t_all / 0.01, 0, 1)
L *= fade * fade_in
R *= fade * fade_in

# léger glue : compression douce + normalisation
mix = np.stack([L, R], 1)
mix = hp(mix.T, 25).T
peak = np.max(np.abs(mix))
mix = mix / peak * 1.4
mix = np.tanh(mix) / np.tanh(1.4)
mix *= 0.89
wavfile.write('music.wav', SR, (mix * 32767).astype(np.int16))
print('ok', mix.shape, np.sqrt(np.mean(mix ** 2)))
