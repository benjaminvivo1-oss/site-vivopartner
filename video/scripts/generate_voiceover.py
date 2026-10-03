#!/usr/bin/env python3
"""
Voix off du trailer, en prises continues (intonation naturelle) découpées à leurs pauses.

Deux moteurs :
- ElevenLabs (recommandé, voix humaine) : utilisé dès que ELEVENLABS_API_KEY est défini.
  Voix : ELEVENLABS_VOICE_ID, sinon « elevenlabs_voice_id » de voiceover.json ; à défaut, la voix est choisie automatiquement dans la bibliothèque ElevenLabs :
  voix française native, professionnelle, faite pour la publicité, la plus utilisée par les
  autres clients. Elle est ajoutée au compte et notée dans src/audio/voiceover.json.
  --samples : génère aussi la première phrase avec les 3 meilleures voix (out/voice-samples/).
- Kokoro (gratuit, hors ligne) : sinon. pip install kokoro-onnx soundfile, puis KOKORO_DIR=…
  (modèle : https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).

Résultat : public/audio/vo/<id>.mp3 + durées dans le JSON. Si une partie dépasse sa scène,
la prise est régénérée un peu plus vite (ElevenLabs).
Pour une vraie voix enregistrée : déposer public/audio/vo/vo-01.mp3 … puis --durations-only.
"""
import json, os, re, subprocess, sys, tempfile, urllib.parse, urllib.request
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


# ───────────── ElevenLabs ─────────────
EL_API = 'https://api.elevenlabs.io'
EL_MODEL = 'eleven_multilingual_v2'


def el_request(path, payload=None, raw=False):
    req = urllib.request.Request(EL_API + path, method='POST' if payload is not None else 'GET',
                                 data=json.dumps(payload).encode() if payload is not None else None,
                                 headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY'],
                                          'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r:
        body = r.read()
    return body if raw else json.loads(body)


def el_best_voices(n=3):
    """Voix françaises de la bibliothèque, classées par usage (publicité, puis narration)."""
    found = []
    for use_case in ('advertisement', 'narrative_story', 'informative_educational'):
        q = urllib.parse.urlencode({'page_size': 50, 'language': 'fr', 'use_cases': use_case,
                                    'sort': 'cloned_by_count'})
        for v in el_request(f'/v1/shared-voices?{q}').get('voices', []):
            accent = str(v.get('accent') or '').lower()
            if any(x in accent for x in ('canad', 'qu', 'belg', 'swiss', 'suisse', 'afric')):
                continue  # on garde l'accent de France
            if v['voice_id'] not in [f['voice_id'] for f in found]:
                found.append(v)
        if len(found) >= n:
            break
    found.sort(key=lambda v: v.get('cloned_by_count', 0), reverse=True)
    return found[:n]


def el_add(v):
    name = f"VP {v['name']}"[:30]
    r = el_request(f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", {'new_name': name})
    return r['voice_id']


def el_synth(text, voice_id, speed, mp3: Path):
    q = urllib.parse.urlencode({'output_format': 'mp3_44100_192'})
    audio = el_request(f'/v1/text-to-speech/{voice_id}?{q}', {
        'text': text, 'model_id': EL_MODEL,
        'voice_settings': {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.3,
                           'use_speaker_boost': True, 'speed': speed},
    }, raw=True)
    mp3.write_bytes(audio)


def scene_budget():
    src = (ROOT / 'src' / 'config.ts').read_text('utf-8')
    block = re.search(r'SCENE_SECONDS = \{(.*?)\}', src, re.S).group(1)
    return {k: float(v) for k, v in re.findall(r'(\w+):\s*([\d.]+)', block)}


def render_take(take, data, engine, voice_id, speed, tmp: Path):
    """Synthétise une prise, la nettoie, la découpe ; renvoie les durées des parties."""
    parts = take['parts']
    raw, clean = tmp / 'raw', tmp / 'clean.wav'
    if engine == 'elevenlabs':
        el_synth(' '.join(p['text'] for p in parts), voice_id, speed, raw.with_suffix('.mp3'))
        src = raw.with_suffix('.mp3')
    else:
        synth(take['say'], data['voice'], data['speed'], raw.with_suffix('.wav'))
        src = raw.with_suffix('.wav')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,' + POLISH,
                    str(clean)], check=True)
    total = duration(clean)
    gaps = silences(clean)
    print(f"« {take['say']} »  {total:.2f} s, pauses : " + ', '.join(f'{a:.2f}–{b:.2f}' for a, b in gaps))
    cuts = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: len(parts) - 1])
    bounds = [0.0] + [(a + b) / 2 for a, b in cuts] + [total]
    if len(bounds) - 1 != len(parts):
        sys.exit(f"Pas assez de pauses pour découper « {take['say']} » en {len(parts)} parties.")
    for part, a, b in zip(parts, bounds, bounds[1:]):
        fade = f'afade=t=in:d=0.03,afade=t=out:st={max(0, b - a - 0.06):.3f}:d=0.06'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}',
                        '-i', str(clean), '-af', fade, '-ac', '1', '-b:a', '160k',
                        str(OUT / f"{part['id']}.mp3")], check=True)


def main():
    data = json.loads(SCRIPT.read_text('utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    only_durations = '--durations-only' in sys.argv
    engine = 'elevenlabs' if os.environ.get('ELEVENLABS_API_KEY') else 'kokoro'
    voice_id = None
    if not only_durations and engine == 'elevenlabs':
        voice_id = os.environ.get('ELEVENLABS_VOICE_ID') or data.get('elevenlabs_voice_id')
        if not voice_id:
            best = el_best_voices(3)
            if not best:
                sys.exit('Aucune voix française trouvée dans la bibliothèque ElevenLabs.')
            for i, v in enumerate(best):
                print(f"  {'→' if i == 0 else ' '} {v['name']} ({v.get('gender')}, {v.get('age')}, {v.get('accent')}) "
                      f"— utilisée {v.get('cloned_by_count', 0)} fois — {v.get('description', '')[:80]}")
            if '--samples' in sys.argv:
                sdir = ROOT / 'out' / 'voice-samples'
                sdir.mkdir(parents=True, exist_ok=True)
                for v in best:
                    vid = el_add(v)
                    el_synth(data['takes'][0]['parts'][0]['text'], vid, 1.0, sdir / f"{v['name']}.mp3")
                print(f'Échantillons : {sdir}')
            voice_id = el_add(best[0])
            data['elevenlabs_voice'] = {'name': best[0]['name'], 'voice_id': voice_id,
                                        'library_voice_id': best[0]['voice_id']}
        print(f'Moteur : ElevenLabs ({EL_MODEL}), voix {voice_id}')
    budget = scene_budget()
    for take in data['takes']:
        if not only_durations:
            speed = float(os.environ.get('VO_SPEED', '1.05'))
            while True:
                with tempfile.TemporaryDirectory() as tmp:
                    render_take(take, data, engine, voice_id, speed, Path(tmp))
                over = [p for p in take['parts'] if p['at'] + duration(OUT / f"{p['id']}.mp3") > budget[p['scene']] + 0.05]
                if not over or engine != 'elevenlabs' or speed >= 1.2:
                    if over:
                        print('  ⚠ déborde de sa scène : ' + ', '.join(p['id'] for p in over))
                    break
                speed = round(min(1.2, speed + 0.05), 2)
                print(f'  trop long pour la scène : nouvel essai à la vitesse {speed}')
        for part in take['parts']:
            part['duration'] = duration(OUT / f"{part['id']}.mp3")
            print(f"  {part['id']}  {part['duration']:5.2f} s  {part['text']}")
    SCRIPT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', 'utf-8')


if __name__ == '__main__':
    main()
