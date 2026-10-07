# Vidéo « Vivo Partner, c'est quoi ? »

`vivopartner-cest-quoi-9x16.mp4` : 49,8 s, 1080 × 1920 (9:16), 60 i/s, H.264 + AAC, normalisée à −14 LUFS (Reels, TikTok, Shorts, stories).
Même langage visuel que la VSL : alternance bleu marine / clair, transition en cercle blanc, texte qui apparaît mot par mot, maquettes d'interface, pastilles « Levier ».

Voix off de Benjamin Vivo, montée sur l'animation : texte, minutages et traitement du son dans [`VOIX-OFF.md`](VOIX-OFF.md).

Ce dossier n'est pas publié avec le site (hors de `public/`).

## Structure

Vidéo « qui je suis » : les trois leviers sont seulement annoncés ; chacun aura sa propre vidéo.

| Temps | Séquence |
| --- | --- |
| 0 – 2,9 s | Recherche « vivo partner c'est quoi » sur un téléphone |
| 2,9 – 8,2 s | Logo, partenaire de croissance digitale du BTP, 12 métiers « … et tous les métiers du BTP », puis temps fort du fondateur : avatar de la mascotte en grand, « Fondé par Benjamin Vivo », « Fondateur · Carcassonne » |
| 8,2 – 14,4 s | Notre objectif : activité, temps, opportunités (4 cartes) |
| 14,4 – 19,1 s | Trois leviers : la visibilité, notre réceptionniste IA, Aplomb notre outil métier sur mesure |
| 19,1 – 23,1 s | « Mais ce n'est pas un pack tout fait » : le même « pack standard » copié-collé sur toutes les entreprises, puis « votre entreprise » s'allume |
| 23,1 – 28,6 s | Notre approche : on s'adapte à vous, votre entreprise, vos process, et pas l'inverse |
| 28,6 – 34,9 s | Audit, puis plan sur mesure |
| 34,9 – 37,2 s | + de clients, + de temps, zéro opportunité perdue |
| 45,1 – 49,8 s | Logo, slogan, vivopartner.com, téléphone et e-mail, « Diagnostic gratuit · 30 min » |

La mascotte apparaît en bas de l'écran à six moments : elle salue (intro), arrive en tenue de chantier (métiers du BTP), explique (trois leviers), croise les bras, sûr de lui (« pas une solution toute faite » ; pose `masc_bras.png`, haut des cheveux reconstruit par `mascotte/src/fix-hair.py`), travaille sur son ordinateur (audit et plan sur mesure) et pointe vers vous (fin). Les poses viennent de la planche `mascotte/mascotte-vivopartner-2.png` : extraites, agrandies ×4 (EDSR) puis détourées (rembg, modèle isnet) ; elles sont dans `mascotte/poses/`.

### Mascotte en 3D

La mascotte n'est pas affichée comme une image plate : elle est rendue en WebGL (three.js) sur le canevas `#m3d`. Pour chaque pose :

- une carte de profondeur (`src/assets/depth_*.png`) a été estimée avec Depth Anything (`mascotte/src/depth.py`) ;
- l'image devient un maillage déformé par cette profondeur, lissée pour éviter les déchirures aux bords. elle reste de face, sans pivoter ;
- l'éclairage est recalculé à chaque image (lumière principale, liseré chaud côté lampe et froid à l'opposé, ombre portée détachée du corps).

Quand elle parle, sa bouche s'ouvre et se ferme (le shader abaisse la lèvre inférieure et dessine l'intérieur de la bouche à partir des repères `MOUTH` de chaque pose) et une bulle « ondes sonores » apparaît à côté de sa tête. Les plages de parole sont dans `TALK` (`src/index.html`) ; la répartition mascotte / fondateur est dans [`VOIX-OFF.md`](VOIX-OFF.md).

Les balises `<img class="masc">` restent dans la page comme repères invisibles : la timeline GSAP les anime (position, inclinaison) et le canevas recopie leur état. `mascotte/src/bundle-3d.py` regroupe images, profondeurs et ombres dans `src/assets/masc3d.js`, chargé directement par la page.

Les scènes détaillées des leviers (`#s5`, `#s6`, `#s7`) restent dans `src/index.html` mais ne sont plus jouées : elles serviront de base aux vidéos dédiées.

L'animation est écrite sur 50,75 s dans `src/index.html`. C'est la voix off qui fixe le tempo : `WARP` (dans `src/assets/voice-env.js`) associe le temps vidéo au temps de l'animation, scène par scène. La musique est générée à tempo constant (`music.py` lit `layout.json` pour caler ses sections et ses impacts sur les scènes), puis accélérée de 25 % (`asetrate`), soit 150 BPM.

## Régénérer la vidéo

Tout est dans `src/` : l'animation est une page HTML pilotée par une timeline GSAP, rendue image par image avec Playwright ; la musique est synthétisée en Python et calée sur les repères (`cues`) exportés par la page.

```bash
cd video/src
npm install
pip install numpy scipy
# 1. voix off : traitement, placement (layout.json + assets/voice-env.js), piste voix
sh ../voix/traitement.sh ../voix/benjamin-voix-off.m4a voix_traitee.wav
python3 ../voix/placement.py layout.json
python3 ../voix/build_track.py layout.json voix_traitee.wav voix.wav assets/voice-env.js
# 2. musique calée sur les scènes
node render.mjs cues cues.json
python3 music.py                                         # -> music.wav
D=$(python3 -c "import json;print(json.load(open('layout.json'))['duration'])")
ffmpeg -i music.wav -af "asetrate=44100*1.25,aresample=44100" -t $D music_fast.wav
python3 ../voix/mix.py music_fast.wav voix.wav mix.wav     # musique baissée sous la voix
# 3. images (60 i/s) puis encodage
N=$(python3 -c "import math;print(math.ceil($D*60))")
for i in 0 1 2 3; do node render.mjs 60 $((i*N/4)) $(((i+1)*N/4)) frames & done; wait
ffmpeg -framerate 60 -i frames/f%05d.jpg -i mix.wav -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart -af "loudnorm=I=-14:TP=-1:LRA=11" \
  -c:a aac -b:a 192k -shortest ../vivopartner-cest-quoi-9x16.mp4
```

Aperçu de quelques instants : `node render.mjs shots 2,26,38 shots`.
Les textes se modifient directement dans `src/index.html`.
