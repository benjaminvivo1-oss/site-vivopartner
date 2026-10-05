# Vidéo « Vivo Partner, c'est quoi ? »

`vivopartner-cest-quoi-9x16.mp4` : 48 s, 1080 × 1920 (9:16), 60 i/s, H.264 + AAC, normalisée à −14 LUFS (Reels, TikTok, Shorts, stories).
Même langage visuel que la VSL : alternance bleu marine / clair, transition en cercle blanc, texte qui apparaît mot par mot, maquettes d'interface, pastilles « Levier ».

La vidéo est calée sur une voix off : texte et minutages dans [`VOIX-OFF.md`](VOIX-OFF.md).

Ce dossier n'est pas publié avec le site (hors de `public/`).

## Structure

| Temps | Séquence |
| --- | --- |
| 0 – 2,9 s | Recherche « vivo partner c'est quoi » sur un téléphone |
| 2,9 – 7,7 s | Logo, partenaire de croissance digitale dédié aux entreprises du BTP (métiers) |
| 7,7 – 13,8 s | Notre objectif : activité, temps, opportunités (4 cartes) |
| 13,8 – 18,9 s | Trois leviers : visibilité, automatisation, outils métier |
| 18,9 – 24 s | Levier 1 · Visibilité (carte, fiche, site, 97 %) |
| 24 – 29,1 s | Levier 2 · Automatisation (réceptionniste IA, agenda, relance) |
| 29,1 – 34,1 s | Levier 3 · Outils métier, Aplomb (tableau de bord, +18 000 €/an) |
| 34,1 – 36,6 s | Et surtout, pas de solution toute faite |
| 36,6 – 42,7 s | Audit, puis plan sur mesure |
| 42,7 – 45,2 s | + de clients, + de temps, zéro opportunité perdue |
| 45,2 – 48 s | Logo, slogan, vivopartner.com, « Diagnostic gratuit · 30 min » |

L'animation est écrite sur 60 s dans `src/index.html` puis jouée 25 % plus vite (constante `K`). La musique est générée sur 60 s puis accélérée de la même façon (`asetrate`), ce qui la passe à 150 BPM.

## Régénérer la vidéo

Tout est dans `src/` : l'animation est une page HTML pilotée par une timeline GSAP, rendue image par image avec Playwright ; la musique est synthétisée en Python et calée sur les repères (`cues`) exportés par la page.

```bash
cd video/src
npm install
pip install numpy scipy
node render.mjs cues cues.json                  # repères son
python3 music.py                                # -> music.wav (60 s)
ffmpeg -i music.wav -af "asetrate=44100*1.25,aresample=44100" -t 48 music_fast.wav
for i in 0 1 2 3; do node render.mjs 60 $((i*720)) $(((i+1)*720)) frames & done; wait
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music_fast.wav -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -af "loudnorm=I=-14:TP=-1:LRA=7" \
  -c:a aac -b:a 192k -shortest ../vivopartner-cest-quoi-9x16.mp4
```

Aperçu de quelques instants : `node render.mjs shots 2,21,46 shots`.
Les textes se modifient directement dans `src/index.html`.
