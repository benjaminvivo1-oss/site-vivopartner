# Vidéo « Vivo Partner, c'est quoi ? »

`vivopartner-cest-quoi-9x16.mp4` : 60 s, 1080 × 1920 (9:16), 60 i/s, H.264 + AAC, normalisée à −14 LUFS (Reels, TikTok, Shorts, stories).
Même langage visuel que la VSL : alternance bleu marine / clair, transition en cercle blanc, texte qui apparaît mot par mot, maquettes d'interface, pastilles « Levier ».

La vidéo est calée sur une voix off : texte et minutages dans [`VOIX-OFF.md`](VOIX-OFF.md).

Ce dossier n'est pas publié avec le site (hors de `public/`).

## Structure

| Temps | Séquence |
| --- | --- |
| 0 – 3,6 s | Recherche « vivo partner c'est quoi » sur un téléphone |
| 3,6 – 9,6 s | Logo, partenaire de croissance digitale dédié aux entreprises du BTP (métiers) |
| 9,6 – 17,2 s | Notre objectif : activité, temps, opportunités (4 cartes) |
| 17,2 – 23,6 s | Trois leviers : visibilité, automatisation, outils métier |
| 23,6 – 30 s | Levier 1 · Visibilité (carte, fiche, site, 97 %) |
| 30 – 36,4 s | Levier 2 · Automatisation (réceptionniste IA, agenda, relance) |
| 36,4 – 42,6 s | Levier 3 · Outils métier, Aplomb (tableau de bord, +18 000 €/an) |
| 42,6 – 45,8 s | Et surtout, pas de solution toute faite |
| 45,8 – 53,4 s | Audit, puis plan sur mesure |
| 53,4 – 56 s | + de clients, + de temps, zéro opportunité perdue |
| 56 – 60 s | Logo, slogan, vivopartner.com, « Diagnostic gratuit · 30 min » |

## Régénérer la vidéo

Tout est dans `src/` : l'animation est une page HTML pilotée par une timeline GSAP, rendue image par image avec Playwright ; la musique est synthétisée en Python et calée sur les repères (`cues`) exportés par la page.

```bash
cd video/src
npm install
pip install numpy scipy
node render.mjs cues cues.json                  # repères son
python3 music.py                                # -> music.wav
for i in 0 1 2 3; do node render.mjs 60 $((i*900)) $(((i+1)*900)) frames & done; wait
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music.wav -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -af "loudnorm=I=-14:TP=-1:LRA=7" \
  -c:a aac -b:a 192k -shortest ../vivopartner-cest-quoi-9x16.mp4
```

Aperçu de quelques instants : `node render.mjs shots 2,26,58 shots`.
Les textes se modifient directement dans `src/index.html`.
