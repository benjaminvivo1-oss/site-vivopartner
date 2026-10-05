# Vidéo « Vivo Partner, c'est quoi ? »

`vivopartner-cest-quoi-9x16.mp4` : 58 s, 1080 × 1920 (9:16), 60 i/s, H.264 + AAC, normalisée à −14 LUFS (Reels, TikTok, Shorts, stories).
Style « motion design premium » : fond sombre, typographie révélée par masques, cartes en verre 3D, plans d'architecte, grain cinéma.

Ce dossier n'est pas publié avec le site (hors de `public/`).

## Structure

| Temps | Séquence |
| --- | --- |
| 0 – 4 s | « Vivo Partner, c'est quoi ? » autour d'une ligne de lumière |
| 4 – 8,6 s | Un partenaire de croissance digitale (courbe de croissance) |
| 8,6 – 12,6 s | Dédié aux entreprises du BTP (plan d'architecte qui se dessine) |
| 12,7 – 21 s | Notre objectif : développer l'activité, gagner du temps, ne plus laisser passer d'opportunités |
| 21 – 24 s | Trois leviers (trois piliers lumineux) |
| 24 – 30 s | 01 · Visibilité |
| 30 – 36 s | 02 · Automatisation |
| 36 – 42 s | 03 · Outils métier |
| 42 – 46 s | Et surtout, pas de solution toute faite |
| 46 – 51,6 s | Audit, puis construction sur mesure |
| 51,6 – 58 s | Logo, slogan, « Réservez votre audit gratuit », vivopartner.com |

## Régénérer la vidéo

Tout est dans `src/` : l'animation est une page HTML pilotée par une timeline GSAP, rendue image par image avec Playwright ; la musique est synthétisée en Python et calée sur les repères (`cues`) exportés par la page.

```bash
cd video/src
npm install
pip install numpy scipy
node render.mjs cues cues.json                  # repères son
python3 music.py                                # -> music.wav
for i in 0 1 2 3; do node render.mjs 60 $((i*870)) $(((i+1)*870)) frames & done; wait
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music.wav -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -af "loudnorm=I=-14:TP=-1:LRA=7" \
  -c:a aac -b:a 192k -shortest ../vivopartner-cest-quoi-9x16.mp4
```

Aperçu de quelques instants : `node render.mjs shots 2,26,54 shots`.
Les textes se modifient directement dans `src/index.html`.
