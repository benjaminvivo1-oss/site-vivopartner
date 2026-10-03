#!/usr/bin/env python3
"""
Musique et bruitages du trailer, entièrement synthétisés (aucun échantillon externe, aucun droit à payer).

    pip install numpy scipy && python3 scripts/generate_music_sfx.py

Écrit public/audio/music.mp3 (60 s, calée sur les scènes) et public/audio/sfx/*.mp3.
La structure suit le découpage du trailer (SCENE_SECONDS dans src/config.ts) :
  0–16 s   tension : nappe grave, battement de cœur, tic-tac qui accélère, montée puis coupure
  16 s     bascule : impact doux, l'harmonie s'éclaire (do majeur)
  16–21 s  nappe + arpège, sans batterie (révélation du logo)
  21–49 s  groove : kick, clap, charleston, basse pompée par le kick (les 3 piliers)
  49–54 s  montée : kick à chaque temps, roulement de caisse claire
  54–60 s  final : accord tenu, arpège, fondu
Si vous changez les durées des scènes, ajustez SECTIONS ci-dessous puis relancez.
"""
import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'audio'
rng = np.random.default_rng(7)

BPM = 120
BEAT = 60 / BPM  # 0,5 s
SECTIONS = dict(tension_end=16.0, reveal_end=21.0, groove_end=49.0, build_end=54.0, end=60.0)
TOTAL = SECTIONS['end']


# ───────────────────────── outils ─────────────────────────
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    n, octave = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (octave + 1) - 69) / 12)


def saw(freq, dur, detune=0.0):
    """Dent de scie à bande limitée (somme d'harmoniques)."""
    t = t_axis(dur)
    out = np.zeros_like(t)
    f = freq * (1 + detune)
    k = 1
    while k * f < SR / 2.2 and k < 40:
        out += np.sin(2 * np.pi * k * f * t + rng.uniform(0, 6.28)) / k
        k += 1
    return out * 0.55


def sine(freq, dur, phase=0.0):
    return np.sin(2 * np.pi * freq * t_axis(dur) + phase)


def env_adsr(n, a, d, s, r, sr=SR):
    a_n, d_n, r_n = int(a * sr), int(d * sr), int(r * sr)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([
        np.linspace(0, 1, max(a_n, 1)),
        np.linspace(1, s, max(d_n, 1)),
        np.full(s_n, s),
        np.linspace(s, 0, max(r_n, 1)),
    ])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def exp_decay(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR / 2.1), 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2.1)], 'band', fs=SR, output='sos'), x)


def sweep_bp(x, f0, f1, q=0.25, blocks=64):
    """Passe-bande dont la fréquence centrale glisse de f0 à f1 (traitement par blocs)."""
    out = np.zeros_like(x)
    edges = np.linspace(0, len(x), blocks + 1).astype(int)
    for i in range(blocks):
        fc = f0 * (f1 / f0) ** (i / max(blocks - 1, 1))
        seg = x[max(0, edges[i] - 512):edges[i + 1]]
        y = bp(seg, fc * (1 - q), fc * (1 + q))
        out[edges[i]:edges[i + 1]] = y[-(edges[i + 1] - edges[i]):]
    return out


def reverb_ir(dur=2.2, decay=0.6, bright=6000):
    n = int(dur * SR)
    ir = rng.standard_normal((2, n)) * np.exp(-np.arange(n) / (decay * SR))
    ir = np.stack([lp(ch, bright) for ch in ir])
    ir[:, :int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
    return ir / np.abs(ir).sum(axis=1, keepdims=True) * 18


IR = reverb_ir()


def reverb(stereo, wet=0.25):
    tail = np.stack([fftconvolve(stereo[i], IR[i])[: stereo.shape[1]] for i in range(2)])
    return stereo * (1 - wet) + tail * wet


def pan(mono, p=0.0):
    """p de -1 (gauche) à 1 (droite), loi à puissance constante."""
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)])


class Track:
    def __init__(self, dur):
        self.buf = np.zeros((2, int(dur * SR) + SR * 3))

    def add(self, sig, at, gain=1.0, p=0.0):
        s = pan(sig, p) if sig.ndim == 1 else sig
        i = int(at * SR)
        n = min(s.shape[1], self.buf.shape[1] - i)
        if n > 0:
            self.buf[:, i:i + n] += s[:, :n] * gain


# ───────────────────────── instruments ─────────────────────────
def kick(dur=0.42, punch=1.0):
    t = t_axis(dur)
    f = 45 + 110 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_decay(len(t), 0.16)
    click = hp(rng.standard_normal(len(t)), 3000) * exp_decay(len(t), 0.003) * 0.4 * punch
    return np.tanh((body + click) * 1.6) * 0.9


def clap():
    n = int(0.35 * SR)
    noise = bp(rng.standard_normal(n), 900, 5000)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += exp_decay(n - i, 0.006 if k < 2 else 0.09)
    return noise * e * 0.6


def hat(open_=False):
    n = int((0.28 if open_ else 0.06) * SR)
    return hp(rng.standard_normal(n), 7000) * exp_decay(n, 0.08 if open_ else 0.014) * 0.35


def snare():
    n = int(0.25 * SR)
    tone = sine(190, 0.25) * exp_decay(n, 0.04)
    noise = bp(rng.standard_normal(n), 1500, 9000) * exp_decay(n, 0.07)
    return (tone * 0.5 + noise * 0.7) * 0.7


def crash(dur=2.4):
    n = int(dur * SR)
    return hp(rng.standard_normal(n), 4500) * exp_decay(n, 0.7) * 0.28


def pad(freqs, dur, cutoff=2400, a=0.6, r=1.2):
    sig = sum(saw(f, dur, d) for f in freqs for d in (-0.004, 0.004)) / (len(freqs) * 1.6)
    sig = lp(sig, cutoff)
    return sig * env_adsr(len(sig), a, 0.4, 0.85, r)


def pluck(freq, dur=0.32):
    s = saw(freq, dur) * exp_decay(int(dur * SR), 0.09)
    t = t_axis(dur)
    # filtre qui se referme vite : attaque brillante, queue ronde
    return lp(s, 1200 + 3500 * np.exp(-t[0])) * 0.6


def bass(freq, dur):
    s = saw(freq, dur) * 0.6 + sine(freq / 2, dur) * 0.5
    return lp(s, 420) * env_adsr(int(dur * SR), 0.005, 0.08, 0.7, 0.05)


def riser(dur):
    n = int(dur * SR)
    noise = sweep_bp(rng.standard_normal(n), 300, 9000, q=0.35)
    t = t_axis(dur)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (t / dur * 2.5)) / SR) * 0.15
    return (noise * 0.6 + tone) * np.linspace(0, 1, n) ** 2


def sidechain(n, hits, depth=0.65, rel=0.22):
    g = np.ones(n)
    r = int(rel * SR)
    curve = 1 - depth * np.exp(-np.arange(r) / (r / 4))
    for h in hits:
        i = int(h * SR)
        if i < n:
            m = min(r, n - i)
            g[i:i + m] = np.minimum(g[i:i + m], curve[:m])
    return g


# ───────────────────────── musique ─────────────────────────
def build_music():
    T = Track(TOTAL)
    s = SECTIONS
    A1, E2, A2 = note('A1'), note('E2'), note('A2')

    # 1) Tension 0–16 s : nappe grave qui s'ouvre, battement de cœur, tic-tac, cordes dissonantes, montée.
    drone_len = s['tension_end']
    drone = saw(A1, drone_len, 0.003) + saw(E2, drone_len, -0.003) * 0.7 + saw(A2, drone_len) * 0.4
    n = len(drone)
    blocks = np.array_split(np.arange(n), 48)
    out = np.zeros(n)
    for i, idx in enumerate(blocks):
        out[idx] = lp(drone[max(0, idx[0] - 2048):idx[-1] + 1], 260 + 900 * (i / 47) ** 1.6)[-len(idx):]
    drone = out * env_adsr(n, 2.5, 0.1, 1, 0.08) * 0.55
    T.add(drone, 0, 0.9)

    for bar in np.arange(0, s['tension_end'] - 0.6, 2 * BEAT * 2):  # battement de cœur toutes les 2 s
        T.add(lp(kick(0.5, 0.2), 180), bar, 0.55)
        T.add(lp(kick(0.5, 0.2), 180), bar + 0.26, 0.38)

    tick = hp(rng.standard_normal(int(0.02 * SR)), 2500) * exp_decay(int(0.02 * SR), 0.003)
    tt = 6.0
    while tt < s['tension_end'] - 0.3:  # tic-tac du chantier à l'horloge, qui accélère
        T.add(tick, tt, 0.22, p=0.3 if int(tt / BEAT) % 2 else -0.3)
        tt += BEAT if tt < 11.5 else BEAT / 2

    strings = pad([note('A4'), note('A#4'), note('E5')], 6.5, cutoff=1800, a=3.5, r=0.2)
    T.add(strings, 9.5, 0.22)
    rz = riser(3.0)
    T.add(rz, s['tension_end'] - 3.0, 0.5)

    # 2) Bascule à 16 s : impact doux + cymbale, l'harmonie s'éclaire.
    T.add(lp(kick(1.2, 0.4), 300), s['tension_end'], 0.9)
    T.add(crash(3.0), s['tension_end'], 0.8)

    # Progression I–V–vi–IV en do majeur, un accord par mesure (2 s).
    chords = [
        (['C4', 'E4', 'G4', 'D5'], 'C2', ['C5', 'E5', 'G5', 'D6']),
        (['B3', 'D4', 'G4', 'A4'], 'G1', ['G4', 'B4', 'D5', 'A5']),
        (['C4', 'E4', 'A4', 'B4'], 'A1', ['A4', 'C5', 'E5', 'B5']),
        (['C4', 'F4', 'A4', 'G4'], 'F1', ['F4', 'A4', 'C5', 'G5']),
    ]
    bar_len = 4 * BEAT
    start = s['tension_end']
    kicks = []
    t0 = start
    bar = 0
    while t0 < s['end'] - 0.01:
        voicing, root, arp = chords[bar % 4]
        in_groove = s['reveal_end'] <= t0 < s['groove_end']
        in_build = s['groove_end'] <= t0 < s['build_end']
        final = t0 >= s['build_end']
        length = min(bar_len, s['end'] - t0)
        if final:
            # accord final tenu jusqu'à la fin
            voicing, root, arp = chords[0]
            length = s['end'] - t0
        T.add(pad([note(v) for v in voicing], length + 0.6, cutoff=2600 if not final else 3200, a=0.25, r=0.6), t0, 0.32)
        # arpège en doubles croches, ping-pong
        for k in range(int(length / (BEAT / 2))):
            f = note(arp[k % 4])
            T.add(pluck(f), t0 + k * BEAT / 2, 0.16 if not final else 0.12, p=-0.45 if k % 2 else 0.45)
        if in_groove or in_build:
            for k in range(4):  # basse en croches, pompée par le kick
                for half in (0, 0.5):
                    T.add(bass(note(root) * 2, BEAT / 2 * 0.9), t0 + (k + half) * BEAT, 0.42)
        if in_groove:
            for k in range(4):
                kicks.append(t0 + k * BEAT)
                T.add(kick(), t0 + k * BEAT, 0.85)
                if k in (1, 3):
                    T.add(clap(), t0 + k * BEAT, 0.5, p=0.05)
                for e in range(4):
                    T.add(hat(open_=(e == 2)), t0 + k * BEAT + e * BEAT / 4, 0.22 if e % 2 else 0.32, p=0.25)
        if in_build:
            for k in range(4):
                kicks.append(t0 + k * BEAT)
                T.add(kick(), t0 + k * BEAT, 0.8)
        t0 += bar_len
        bar += 1

    # Relances de section : roulement + cymbale au début de chaque pilier (21, 31, 40 s) et au final (54 s).
    for at in (21.0, 31.0, 40.0, 49.0):
        for k in range(8):
            T.add(snare(), at - BEAT * 2 + k * BEAT / 4, 0.15 + 0.05 * k)
        T.add(crash(), at, 0.55)
    roll_start = s['build_end'] - 2.0
    for k in range(16):  # roulement montant avant le final
        T.add(snare(), roll_start + k * BEAT / 4, 0.12 + 0.04 * k)
    T.add(riser(2.0), roll_start, 0.35)
    T.add(crash(4.0), s['build_end'], 0.8)
    T.add(lp(kick(1.4, 0.5), 260), s['build_end'], 0.9)

    mix = T.buf[:, : int(TOTAL * SR)]
    # pompage : on creuse la musique (hors kick) à chaque temps du groove
    mix *= sidechain(mix.shape[1], kicks, depth=0.35)[None, :]
    mix = reverb(mix, 0.18)
    # fondu de fin
    fade = int(3.0 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
    return master(mix)


def master(mix):
    mix = np.tanh(mix * 1.1)
    peak = np.abs(mix).max()
    return mix / peak * 0.89


# ───────────────────────── bruitages ─────────────────────────
def sfx_bank():
    bank = {}
    # Vibreur de téléphone posé sur une table : bourdonnement 170 Hz avec cliquetis.
    n = int(0.74 * SR)
    t = t_axis(0.74)
    buzz = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.5 + np.sin(2 * np.pi * 344 * t) * 0.3
    rattle = bp(rng.standard_normal(n), 1800, 4000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 172 * t))) * 0.25
    bank['vibrate'] = lp(buzz + rattle, 2600) * env_adsr(n, 0.02, 0.05, 0.9, 0.06) * 0.6
    # Notification « appel manqué » : petit carillon à deux partiels.
    n = int(0.6 * SR)
    bank['notif'] = (sine(1318.5, 0.6) * exp_decay(n, 0.12) + sine(1975.5, 0.6) * exp_decay(n, 0.07) * 0.6
                     + sine(2637, 0.6) * exp_decay(n, 0.03) * 0.3) * 0.5
    # Feuille de devis qui tombe : froissement + léger choc.
    n = int(0.22 * SR)
    bank['paper'] = (bp(rng.standard_normal(n), 900, 4500) * exp_decay(n, 0.035) * 0.6
                     + lp(kick(0.22, 0), 200) * 0.5)
    # Tampon « En retard » : choc sourd.
    bank['stamp'] = lp(kick(0.5, 1.2), 900) * 1.1
    # Tic d'horloge.
    n = int(0.03 * SR)
    bank['tick'] = bp(rng.standard_normal(n), 2500, 7000) * exp_decay(n, 0.004) * 0.8
    # Pop d'interface : petite note qui glisse vers l'aigu.
    t = t_axis(0.12)
    f = 420 + 700 * (1 - np.exp(-t * 60))
    bank['pop'] = np.sin(2 * np.pi * np.cumsum(f) / SR) * exp_decay(len(t), 0.03) * 0.6
    # Clic d'interface.
    n = int(0.04 * SR)
    bank['click'] = (hp(rng.standard_normal(n), 3000) * exp_decay(n, 0.002) + sine(2200, 0.04) * exp_decay(n, 0.006)) * 0.5
    # Validation : deux notes cristallines (mi → si).
    a = sine(1318.5, 0.7) * exp_decay(int(0.7 * SR), 0.18)
    b = sine(1975.5, 0.6) * exp_decay(int(0.6 * SR), 0.2)
    ok = np.zeros(int(0.8 * SR))
    ok[: len(a)] += a * 0.45
    ok[int(0.09 * SR): int(0.09 * SR) + len(b)] += b * 0.45
    bank['success'] = ok
    # Souffle (transitions, cartes qui entrent).
    n = int(0.9 * SR)
    bank['whoosh'] = sweep_bp(rng.standard_normal(n), 400, 5000, q=0.4) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.8
    # Scintillement du logo.
    sh = np.zeros(int(1.6 * SR))
    for k, nm in enumerate(['C6', 'E6', 'G6', 'C7', 'E7']):
        tone = sine(note(nm), 1.2) * exp_decay(int(1.2 * SR), 0.25) * 0.22
        i = int(k * 0.06 * SR)
        sh[i: i + len(tone)] += tone
    bank['shimmer'] = sh
    # Pin qui tombe : sifflet descendant puis petit choc.
    t = t_axis(0.42)
    f = 1700 * np.exp(-t * 4)
    whistle = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.linspace(0.1, 0.5, len(t))
    k = lp(kick(0.3, 0.6), 600)
    thud = np.zeros(len(whistle) + len(k))
    thud[: len(whistle)] += whistle * 0.35
    thud[len(whistle) - 200: len(whistle) - 200 + len(k)] += k * 0.8
    bank['drop'] = thud
    # Impact (bénéfices) : sub + transitoire + queue.
    n = int(1.4 * SR)
    t = t_axis(1.4)
    sub = np.sin(2 * np.pi * np.cumsum(40 + 70 * np.exp(-t * 18)) / SR) * exp_decay(n, 0.35)
    trans = bp(rng.standard_normal(n), 500, 6000) * exp_decay(n, 0.05)
    bank['impact'] = np.tanh((sub + trans * 0.5) * 1.5) * 0.85
    # Frappe au clavier (transcription) : rafale de petits clics.
    ty = np.zeros(int(0.5 * SR))
    for k in range(7):
        c = bank['click'] * rng.uniform(0.5, 1.0)
        i = int((k * 0.065 + rng.uniform(0, 0.02)) * SR)
        ty[i: i + len(c)] += c
    bank['typing'] = ty * 0.7
    # Courbe qui monte : glissando doux.
    t = t_axis(1.2)
    f = 300 * 2 ** (t / 1.2 * 2)
    bank['rise'] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, len(t))) * 0.25
    return bank


# ───────────────────────── écriture ─────────────────────────
def write_mp3(path: Path, data: np.ndarray, kbps=192):
    path.parent.mkdir(parents=True, exist_ok=True)
    if data.ndim == 1:
        data = np.stack([data, data])
    pcm = (np.clip(data.T, -1, 1) * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-',
                    '-b:a', f'{kbps}k', str(path)], input=pcm, check=True)


def main():
    write_mp3(OUT / 'music.mp3', build_music())
    print('music.mp3')
    for name, sig in sfx_bank().items():
        sig = sig / max(np.abs(sig).max(), 1e-6) * 0.9
        tail = np.zeros(int(0.05 * SR))
        write_mp3(OUT / 'sfx' / f'{name}.mp3', np.concatenate([sig, tail]), kbps=128)
        print(f'sfx/{name}.mp3')


if __name__ == '__main__':
    main()
