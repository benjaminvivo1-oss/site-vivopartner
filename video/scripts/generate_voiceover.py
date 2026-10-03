#!/usr/bin/env python3
"""
Voix off de synthèse (Piper, voix française « siwis », licence CC-BY 4.0).

Lit src/audio/voiceover.json, synthétise chaque phrase (champ « say »), la traite (filtre, compression,
normalisation) et l'écrit en MP3 dans public/audio/vo/<id>.mp3, puis note sa durée dans le JSON.

Pré-requis : ffmpeg, et Piper (https://github.com/rhasspy/piper/releases) :
    PIPER_BIN=/chemin/vers/piper  PIPER_MODEL=/chemin/vers/fr-siwis-medium.onnx  python3 scripts/generate_voiceover.py

Pour remplacer la voix de synthèse par un enregistrement réel : déposer vos fichiers
public/audio/vo/vo-01.mp3 … (même découpage) et relancer avec --durations-only.
"""
import json, os, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / 'src' / 'audio' / 'voiceover.json'
OUT = ROOT / 'public' / 'audio' / 'vo'
LENGTH_SCALE = os.environ.get('VO_LENGTH_SCALE', '0.95')  # < 1 : débit un peu plus soutenu

# Chaîne de traitement : coupe le grave, présence, compression douce, niveau -16 LUFS.
FILTERS = ','.join([
    'silenceremove=start_periods=1:start_threshold=-45dB',
    'areverse', 'silenceremove=start_periods=1:start_threshold=-45dB', 'areverse',
    'highpass=f=90',
    'equalizer=f=3200:t=q:w=1.2:g=2.5',
    'acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2',
    'loudnorm=I=-16:TP=-1.5:LRA=7',
    'aresample=44100',
])


def duration(path: Path) -> float:
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)])
    return round(float(out), 3)


def main():
    data = json.loads(SCRIPT.read_text('utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    only_durations = '--durations-only' in sys.argv
    if not only_durations:
        piper, model = os.environ.get('PIPER_BIN'), os.environ.get('PIPER_MODEL')
        if not piper or not model:
            sys.exit('PIPER_BIN et PIPER_MODEL doivent être définis (voir l’en-tête du script).')
    for line in data['lines']:
        mp3 = OUT / f"{line['id']}.mp3"
        if not only_durations:
            with tempfile.TemporaryDirectory() as tmp:
                wav = Path(tmp) / 'raw.wav'
                subprocess.run([piper, '-m', model, '--length_scale', LENGTH_SCALE, '-f', str(wav)],
                               input=line['say'].encode('utf-8'), check=True, capture_output=True)
                subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav), '-af', FILTERS,
                                '-ac', '1', '-b:a', '128k', str(mp3)], check=True)
        line['duration'] = duration(mp3)
        print(f"{line['id']}  {line['duration']:5.2f} s  {line['text']}")
    SCRIPT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', 'utf-8')


if __name__ == '__main__':
    main()
