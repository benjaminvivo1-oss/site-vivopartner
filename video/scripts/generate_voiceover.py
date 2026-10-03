#!/usr/bin/env python3
"""
Voix off de synthèse : Kokoro (modèle ouvert, licence Apache 2.0), voix française « ff_siwis ».

Chaque prise (« take ») de src/audio/voiceover.json est dite d'un seul souffle, pour une intonation
naturelle, puis, si elle a plusieurs parties, découpée à ses pauses les plus longues : chaque partie
est placée dans sa scène. Résultat : public/audio/vo/<id>.mp3 + durées notées dans le JSON.
Les instants des pauses de chaque prise sont affichés (utile pour caler BENEFIT_HITS, scène 7).

Pré-requis : ffmpeg, puis
    pip install kokoro-onnx soundfile
    # modèle (≈ 330 Mo) : https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
    KOKORO_DIR=/dossier/contenant/kokoro-v1.0.onnx+voices-v1.0.bin python3 scripts/generate_voiceover.py

Pour une vraie voix enregistrée : déposer public/audio/vo/vo-01.mp3 … (même découpage que les
« parts ») puis relancer avec --durations-only.
"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / 'src' / 'audio' / 'voiceover.json'
OUT = ROOT / 'public' / 'audio' / 'vo'

# Traitement : coupe le grave, un peu de présence, compression douce, -16 LUFS.
POLISH = 'highpass=f=80,equalizer=f=3000:t=q:w=1.4:g=2,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=150:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=44100'


def duration(path: Path) -> float:
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)])
    return round(float(out), 3)


def silences(wav: Path, noise='-38dB', min_d=0.12):
    log = subprocess.run(['ffmpeg', '-i', str(wav), '-af', f'silencedetect=noise={noise}:d={min_d}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    return list(zip(starts, ends))


def synth(text, voice, speed, wav: Path):
    import soundfile as sf
    from kokoro_onnx import Kokoro
    kdir = Path(os.environ.get('KOKORO_DIR', '.'))
    k = synth.model = getattr(synth, 'model', None) or Kokoro(str(kdir / 'kokoro-v1.0.onnx'), str(kdir / 'voices-v1.0.bin'))
    samples, sr = k.create(text, voice=voice, speed=speed, lang='fr-fr')
    sf.write(str(wav), samples, sr)


def main():
    data = json.loads(SCRIPT.read_text('utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    only_durations = '--durations-only' in sys.argv
    for take in data['takes']:
        parts = take['parts']
        if not only_durations:
            with tempfile.TemporaryDirectory() as tmp:
                raw, clean = Path(tmp) / 'raw.wav', Path(tmp) / 'clean.wav'
                synth(take['say'], data['voice'], data['speed'], raw)
                subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(raw), '-af',
                                'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                                'silenceremove=start_periods=1:start_threshold=-45dB,areverse,' + POLISH,
                                str(clean)], check=True)
                total = duration(clean)
                gaps = silences(clean)
                print(f"« {take['say']} »  {total:.2f} s, pauses : " + ', '.join(f'{a:.2f}–{b:.2f}' for a, b in gaps))
                # coupe au milieu des (n-1) pauses les plus longues, dans l'ordre chronologique
                cuts = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: len(parts) - 1])
                bounds = [0.0] + [(a + b) / 2 for a, b in cuts] + [total]
                if len(bounds) - 1 != len(parts):
                    sys.exit(f"Pas assez de pauses pour découper « {take['say']} » en {len(parts)} parties.")
                for part, a, b in zip(parts, bounds, bounds[1:]):
                    fade = f'afade=t=in:d=0.03,afade=t=out:st={max(0, b - a - 0.06):.3f}:d=0.06'
                    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}',
                                    '-i', str(clean), '-af', fade, '-ac', '1', '-b:a', '160k',
                                    str(OUT / f"{part['id']}.mp3")], check=True)
        for part in parts:
            part['duration'] = duration(OUT / f"{part['id']}.mp3")
            print(f"  {part['id']}  {part['duration']:5.2f} s  {part['text']}")
    SCRIPT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', 'utf-8')


if __name__ == '__main__':
    main()
