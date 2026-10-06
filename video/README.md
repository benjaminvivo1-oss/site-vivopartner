# Vidéo « Vivo Partner, c'est quoi ? »

`vivopartner-cest-quoi-9x16.mp4` : 40 s, 1080 × 1920 (9:16), 60 i/s, H.264 + AAC, normalisée à −14 LUFS (Reels, TikTok, Shorts, stories).
Même langage visuel que la VSL : alternance bleu marine / clair, transition en cercle blanc, texte qui apparaît mot par mot, maquettes d'interface, pastilles « Levier ».

La vidéo est calée sur une voix off : texte et minutages dans [`VOIX-OFF.md`](VOIX-OFF.md).

Ce dossier n'est pas publié avec le site (hors de `public/`).

## Structure

Vidéo « qui je suis » : les trois leviers sont seulement annoncés ; chacun aura sa propre vidéo.

| Temps | Séquence |
| --- | --- |
| 0 – 2,9 s | Recherche « vivo partner c'est quoi » sur un téléphone |
| 2,9 – 8,2 s | Logo, partenaire de croissance digitale du BTP, basé à Carcassonne, 12 métiers « … et tous les métiers du BTP » |
| 8,2 – 14,4 s | Notre objectif : activité, temps, opportunités (4 cartes) |
| 14,4 – 19,1 s | Trois leviers : la visibilité, notre réceptionniste IA, Aplomb notre outil métier sur mesure |
| 19,1 – 23,1 s | Et surtout : le même « pack standard » copié-collé sur toutes les entreprises, puis « votre entreprise » s'allume |
| 23,1 – 28,6 s | Notre approche : on s'adapte à vous, votre entreprise, vos process, et pas l'inverse |
| 28,6 – 34,9 s | Audit, puis plan sur mesure |
| 34,9 – 37,2 s | + de clients, + de temps, zéro opportunité perdue |
| 37,2 – 40 s | Logo, slogan, vivopartner.com, « Diagnostic gratuit · 30 min » |

La mascotte apparaît en bas de l'écran à six moments : elle salue (intro), arrive en tenue de chantier (métiers du BTP), explique (trois leviers), réfléchit (« pas une solution toute faite »), travaille sur son ordinateur (audit et plan sur mesure) et pointe vers vous (fin). Les poses viennent de la planche `mascotte/mascotte-vivopartner-2.png` : extraites, agrandies ×4 (EDSR) puis détourées (rembg, modèle isnet) ; elles sont dans `mascotte/poses/`.

Les scènes détaillées des leviers (`#s5`, `#s6`, `#s7`) restent dans `src/index.html` mais ne sont plus jouées : elles serviront de base aux vidéos dédiées.

L'animation est écrite sur 50 s dans `src/index.html` puis jouée 25 % plus vite (constante `K`). La musique est générée sur 50 s puis accélérée de la même façon (`asetrate`), ce qui la passe à 150 BPM.

## Régénérer la vidéo

Tout est dans `src/` : l'animation est une page HTML pilotée par une timeline GSAP, rendue image par image avec Playwright ; la musique est synthétisée en Python et calée sur les repères (`cues`) exportés par la page.

```bash
cd video/src
npm install
pip install numpy scipy
node render.mjs cues cues.json                  # repères son
python3 music.py                                # -> music.wav (50 s)
ffmpeg -i music.wav -af "asetrate=44100*1.25,aresample=44100" -t 40 music_fast.wav
for i in 0 1 2 3; do node render.mjs 60 $((i*600)) $(((i+1)*600)) frames & done; wait
ffmpeg -framerate 60 -i frames/f%05d.jpg -i music_fast.wav -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -af "loudnorm=I=-14:TP=-1:LRA=7" \
  -c:a aac -b:a 192k -shortest ../vivopartner-cest-quoi-9x16.mp4
```

Aperçu de quelques instants : `node render.mjs shots 2,26,38 shots`.
Les textes se modifient directement dans `src/index.html`.
