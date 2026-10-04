#!/usr/bin/env python3
"""
Dialogue du pilier 2 (client ↔ réceptionniste IA), lu dans src/audio/dialogue.json.

Sources, par ordre de priorité, pour chaque réplique :
  1. audio-sources/dialogue-<id>.mp3 (prise ElevenLabs ou enregistrement réel, recommandé) ;
  2. sinon une voix locale provisoire : Piper « gilles » (homme) pour le client, Kokoro « ff_siwis »
     (femme, posée) pour l'IA. Variables : PIPER_BIN, PIPER_MODEL, KOKORO_DIR.

Traitement : le client passe par un filtre « téléphone » (300–3 400 Hz), l'IA reste claire ; les deux
sont normalisées. Écrit public/audio/dialogue/<id>.mp3 et met à jour at / duration dans le JSON.

Recalage automatique : la voix off qui suit le dialogue (vo-05, « vous ne ratez plus un seul appel »)
démarre juste après la dernière réplique, et la durée de la scène receptionniste (SCENE_SECONDS dans
src/config.ts) est ajustée pour finir peu après. Relancer ensuite npm run audio:music.
"""
import json, os, re, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / 'src' / 'audio' / 'dialogue.json'
OUT = ROOT / 'public' / 'audio' / 'dialogue'
SRC = ROOT / 'audio-sources'
VO = ROOT / 'src' / 'audio' / 'voiceover.json'
CONFIG = ROOT / 'src' / 'config.ts'
VO_AFTER = 'vo-05'  # voix off placée juste après le dialogue
VO_GAP = 0.1        # silence entre la dernière réplique et vo-05 (s)
TAIL = 0.35         # temps après vo-05 avant la scène suivante (s)

TRIM = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
        'silenceremove=start_periods=1:start_threshold=-45dB,areverse')
FX = {
    'client': 'highpass=f=300,lowpass=f=3400,acompressor=threshold=-20dB:ratio=3:makeup=3,loudnorm=I=-17:TP=-1.5',
    'ia': 'highpass=f=80,equalizer=f=3000:t=q:w=1.4:g=1.5,acompressor=threshold=-22dB:ratio=2.5:makeup=2,loudnorm=I=-16:TP=-1.5',
}


def duration(p: Path) -> float:
    return round(float(subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)])), 3)


def placeholder(line, wav: Path):
    text = line.get('say', line['text'])
    if line['id'] == 'client':
        subprocess.run([os.environ['PIPER_BIN'], '-m', os.environ['PIPER_MODEL'], '--length_scale', '0.92',
                        '-f', str(wav)], input=text.encode(), check=True, capture_output=True)
    else:
        import soundfile as sf
        from kokoro_onnx import Kokoro
        kdir = Path(os.environ['KOKORO_DIR'])
        k = Kokoro(str(kdir / 'kokoro-v1.0.onnx'), str(kdir / 'voices-v1.0.bin'))
        samples, sr = k.create(text, voice='ff_siwis', speed=1.0, lang='fr-fr')
        sf.write(str(wav), samples, sr)


def main():
    data = json.loads(SCRIPT.read_text('utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    t = data['start']
    for line in data['lines']:
        src = SRC / f"dialogue-{line['id']}.mp3"
        with tempfile.TemporaryDirectory() as tmp:
            if src.exists():
                inp, line['source'] = src, src.name
            else:
                inp = Path(tmp) / 'raw.wav'
                placeholder(line, inp)
                line['source'] = 'voix provisoire locale'
            out = OUT / f"{line['id']}.mp3"
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(inp), '-af', f"{TRIM},{FX[line['id']]},aresample=44100",
                            '-ac', '1', '-b:a', '160k', str(out)], check=True)
        line['duration'] = duration(out)
        line['at'] = round(t, 3)
        t += line['duration'] + data['gap']
        print(f"{line['id']:7} {line['at']:5.2f} s → {line['at'] + line['duration']:5.2f} s  ({line['source']})  {line['text']}")
    SCRIPT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', 'utf-8')

    end = t - data['gap']
    vo = json.loads(VO.read_text('utf-8'))
    part = next(p for take in vo['takes'] for p in take['parts'] if p['id'] == VO_AFTER)
    part['at'] = round(end + VO_GAP, 2)
    VO.write_text(json.dumps(vo, ensure_ascii=False, indent=2) + '\n', 'utf-8')
    scene = round(part['at'] + part.get('duration', 1.6) + TAIL, 1)
    cfg = CONFIG.read_text('utf-8')
    cfg = re.sub(r'(receptionniste:\s*)[\d.]+', lambda m: f"{m.group(1)}{scene}", cfg, count=1)
    CONFIG.write_text(cfg, 'utf-8')
    print(f"{VO_AFTER} à {part['at']:.2f} s ; scène receptionniste = {scene} s")


if __name__ == '__main__':
    main()
