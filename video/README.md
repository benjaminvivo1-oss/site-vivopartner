# Vidéo « Vivo Partner, c'est quoi ? »

`vivopartner-cest-quoi-9x16.mp4` : 48 s, 1080 × 1920 (9:16), 60 i/s, H.264 + AAC, normalisée à −14 LUFS (Reels, TikTok, Shorts, stories).

Ce dossier n'est pas publié avec le site (hors de `public/`).

## Structure

| Temps | Séquence |
| --- | --- |
| 0 – 3 s | Accroche : « VIVO PARTNER, c'est quoi ? » |
| 3 – 8 s | Partenaire de croissance digitale, dédié aux entreprises du BTP |
| 8 – 14 s | Objectif : développer l'activité, gagner du temps, ne plus perdre d'opportunités |
| 14 – 16 s | 3 leviers |
| 16 – 21 s | 01 Visibilité (recherche Google, fiche, avis, appel entrant) |
| 21 – 26 s | 02 Automatisation (appel, réceptionniste IA, agenda, SMS) |
| 26 – 31 s | 03 Outils métier (tableau de bord Aplomb, devis signés, relances) |
| 31 – 33 s | Récapitulatif des trois leviers |
| 33 – 37 s | « Et surtout… pas de solution toute faite » |
| 37 – 42 s | Audit, puis construction sur mesure |
| 42 – 48 s | Logo, slogan, « Audit gratuit · 30 min », vivopartner.com |

## Régénérer la vidéo

Tout est dans `src/` : l'animation est une page HTML pilotée par une timeline GSAP, rendue image par image avec Playwright ; la musique est synthétisée en Python et calée sur les repères (`cues`) exportés par la page.

```bash
cd video/src
npm install
pip install numpy scipy
node render.mjs cues cues.json                  # repères son
python3 music.py                                # -> music.wav
for i in 0 1 2 3; do node render.mjs 60 $((i*720)) $(((i+1)*720)) frames & done; wait
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music.wav -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -af "loudnorm=I=-14:TP=-1:LRA=7" \
  -c:a aac -b:a 192k -shortest ../vivopartner-cest-quoi-9x16.mp4
```

Aperçu de quelques instants : `node render.mjs shots 1.5,18,44 shots`.
Les textes se modifient directement dans `src/index.html`.
